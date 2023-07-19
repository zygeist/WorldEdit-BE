import { Jobs } from "@modules/jobs.js";
import { RawText, regionBounds, Vector } from "@notbeer-api";
import { BlockPermutation } from "@minecraft/server";
import { SphereShape } from "../../shapes/sphere.js";
import { registerCommand } from "../register_commands.js";
import { fluidLookPositions, lavaMatch } from "./drain.js";
import { floodFill } from "./floodfill_func.js";

const registerInformation = {
  name: "gravel",
  permission: "worldedit.utility.gravel",
  description: "commands.wedit:gravel.description",
  usage: [
    { flag: "c"
    },
    {
      name: "radius",
      type: "float"
    }
  ]
};

registerCommand(registerInformation, function* (session, builder, args) {
  // TODO: Assert Can Build within

  const dimension = builder.dimension;
  const playerBlock = session.getPlacementPosition();
  let gravelStart: Vector;
  for (const offset of fluidLookPositions) {
    const loc = playerBlock.offset(offset.x, offset.y, offset.z);
    const block = dimension.getBlock(loc);
    if (block.typeId.match(lavaMatch)) {
      gravelStart = loc;
      break;
    }
  }

  if (!gravelStart) {
    throw "commands.wedit:gravel.noGravel";
  }

  const job = Jobs.startJob(session, 1, new SphereShape(args.get("radius")).getRegion(gravelStart));
  Jobs.nextStep(job, "Calculating and replacing gravel...");
  const blocks = yield* floodFill(gravelStart, args.get("radius"), (ctx, dir) => {
    const block = dimension.getBlock(ctx.worldPos.offset(dir.x, dir.y, dir.z));
    if (!block.typeId.match(lavaMatch)) return false;
    return true;
  });

  if (blocks.length) {
    const [min, max] = regionBounds(blocks);

    const history = session.getHistory();
    const record = history.record();
    const lava = BlockPermutation.resolve("minecraft:gravel");
    try {
      history.addUndoStructure(record, min, max, blocks);
      let i = 0;
      for (const loc of blocks) {
        const block = dimension.getBlock(loc);
        block.setPermutation(lava);
        Jobs.setProgress(job, i++ / blocks.length);
        yield;
      }
      history.addRedoStructure(record, min, max, blocks);
      history.commit(record);
    } catch (err) {
      history.cancel(record);
      throw err;
    } finally {
      Jobs.finishJob(job);
    }
  } else {
    Jobs.finishJob(job);
  }

  return RawText.translate("commands.blocks.wedit:changed").with(`${blocks.length}`);
});
