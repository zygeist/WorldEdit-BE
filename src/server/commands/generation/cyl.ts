import { Jobs } from "@modules/jobs.js";
import { Pattern } from "@modules/pattern.js";
import { RawText } from "@notbeer-api";
import { CylinderShape } from "../../shapes/cylinder.js";
import { registerCommand } from "../register_commands.js";

const registerInformation = {
  name: "cyl",
  permission: "worldedit.generation.cylinder",
  description: "commands.wedit:cyl.description",
  usage: [
    {
      flag: "h"
    }, {
      flag: "r"
    }, {
      flag: "x"
    }, {
      flag: "z"
    }, {
      name: "pattern",
      type: "Pattern"
    }, {
      subName: "_x",
      args: [
        {
          name: "radii",
          type: "float",
          range: [0.01, null] as [number, null]
        }, {
          name: "length",
          type: "int",
          default: 1,
          range: [1, null] as [number, null]
        }
      ]
    }, {
      subName: "_xz",
      args: [
        {
          name: "radiiX",
          type: "float",
          range: [0.01, null] as [number, null]
        }, {
          name: "radiiZ",
          type: "float",
          range: [0.01, null] as [number, null]
        }, {
          name: "length",
          type: "int",
          default: 1,
          range: [1, null] as [number, null]
        }
      ]
    }
  ]
};

registerCommand(registerInformation, function* (session, builder, args) {
  const pattern: Pattern = args.get("pattern");
  let radii: [number, number];
  const length: number = args.get("length");
  const isHollow = args.has("h");
  const isRaised = args.has("r");
  let axis: number;

  if (args.has("x"))
    axis = 1;
  else if (args.has("z"))
    axis = 2;
  else
    axis = 0;

  if (args.has("_x"))
    radii = [args.get("radii"), args.get("radii")];
  else
    radii = [args.get("radiiX"), args.get("radiiZ")];

  const loc = session.getPlacementPosition().offset(0, isRaised ? length/2 : 0, 0);

  const cylShape = new CylinderShape(axis, length, ...<[number, number]>radii);
  const job = Jobs.startJob(session, 2, cylShape.getRegion(loc));
  const count = yield* Jobs.perform(job, cylShape.generate(loc, pattern, null, session, {"hollow": isHollow}));
  Jobs.finishJob(job);

  return RawText.translate("commands.blocks.wedit:created").with(`${count}`);
});
