import { assertSelection } from "@modules/assert.js";
import { Jobs } from "@modules/jobs.js";
import { RawText, Vector } from "@notbeer-api";
import { registerCommand } from "../register_commands.js";
import { CuboidShape } from "server/shapes/cuboid.js";

const registerInformation = {
  name: "center",
  permission: "worldedit.region.center",
  description: "commands.wedit:center.description",
  usage: [
    {
      name: "pattern",
      type: "Pattern"
    }
  ],
  aliases: ["middle"]
};

registerCommand(registerInformation, function* (session, builder, args) {
  assertSelection(session);
  if (args.get("_using_item") && session.globalPattern.empty()) {
    throw "worldEdit.selectionFill.noPattern";
  }

  const pattern = args.get("_using_item") ? session.globalPattern : args.get("pattern");

  const range = session.selection.getRange();
  const center = Vector.add(range[0], range[1]).mul(0.5);
  const [start, end] = [center.floor().toBlock(), center.ceil().toBlock()];

  const shape = new CuboidShape(...Vector.sub(end, start).add(1).toArray());
  const job = (yield Jobs.startJob(session, 2, [start, end])) as number;
  const count = yield* Jobs.perform(job, shape.generate(start, pattern, null, session));
  Jobs.finishJob(job);

  return RawText.translate("commands.blocks.wedit:changed").with(`${count}`);
});