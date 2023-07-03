import { RawText } from "@notbeer-api";
import { getCommandFunc, registerCommand } from "../register_commands.js";

const registerInformation = {
  name: "hcube",
  permission: "worldedit.generation.cube",
  description: "commands.wedit:hcube.description",
  usage: [
    {
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
  args.set("h", true);
  return yield* getCommandFunc("cube")(session, builder, args) as Generator<unknown, RawText | string>;
});