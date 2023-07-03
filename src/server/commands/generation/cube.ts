import { Jobs } from "@modules/jobs.js";
import { Pattern } from "@modules/pattern.js";
import { RawText } from "@notbeer-api";
import { CuboidShape } from "../../shapes/cuboid.js";
import { registerCommand } from "../register_commands.js";

const registerInformation = {
  name: "cube",
  permission: "worldedit.generation.cube",
  description: "commands.wedit:cube.description",
  usage: [
    {
      flag: "h"
    }, {
      flag: "r"
    }, {
      name: "pattern",
      type: "Pattern"
    }, {
      subName: "_x",
      args: [
        {
          name: "length",
          type: "int",
          range: [1, null] as [number, null]
        }
      ]
    }, {
      subName: "_xy",
      args: [
        {
          name: "length",
          type: "int",
          range: [1, null] as [number, null]
        }, {
          name: "height",
          type: "int",
          range: [1, null] as [number, null]
        }
      ]
    }, {
      subName: "_xyz",
      args: [
        {
          name: "length",
          type: "int",
          range: [1, null] as [number, null]
        }, {
          name: "width",
          type: "int",
          range: [1, null] as [number, null]
        }, {
          name: "height",
          type: "int",
          range: [1, null] as [number, null]
        }
      ]
    }
  ]
};

registerCommand(registerInformation, function* (session, builder, args) {
  const pattern: Pattern = args.get("pattern");
  let size: [number, number, number];
  const isHollow = args.has("h");
  const isRaised = args.has("r");

  if (args.has("_x"))
    size = [args.get("length"), args.get("length"), args.get("length")];
  else if (args.has("_xy"))
    size = [args.get("length"), args.get("length"), args.get("height")];
  else
    size = [args.get("length"), args.get("width"), args.get("height")];

  const loc = session.getPlacementPosition().offset(0, isRaised ? size[1] : 0, 0);

  const cuboidShape = new CuboidShape(...size);
  const job = Jobs.startJob(session, 2, cuboidShape.getRegion(loc));
  const count = yield* Jobs.perform(job, cuboidShape.generate(loc, pattern, null, session, {"hollow": isHollow}));
  Jobs.finishJob(job);

  return RawText.translate("commands.blocks.wedit:created").with(`${count}`);
});
