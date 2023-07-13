import { PlayerUtil } from "@modules/player_util.js";
import { RawText, Vector } from "@notbeer-api";
import { registerCommand } from "../register_commands.js";
import { Player } from "@minecraft/server";

const registerInformation = {
  name: "ascend",
  permission: "worldedit.navigation.ascend",
  description: "commands.wedit:ascend.description",
  usage: [
    {
      name: "levels",
      type: "int",
      default: 1
    }
  ]
};

function ascend(builder: Player) {
  const location = PlayerUtil.getBlockLocation(builder);
  const dimension = builder.dimension;

  for (let i = location.y + 3; i <= 319; i++) {
    const floor = new Vector(location.x, i - 1, location.z);
    const legs = new Vector(location.x, i, location.z);
    const head = new Vector(location.x, i + 1, location.z);

    let invalid = false;

    if (dimension.getBlock(floor).isAir()) invalid = true;
    if (!dimension.getBlock(legs).isAir()) invalid = true;
    if (!dimension.getBlock(head).isAir()) invalid = true;

    if (!invalid) {
      const rot = builder.getRotation();
      builder.teleport(new Vector(location.x + 0.5, legs.y, location.z + 0.5), { dimension });
      return RawText.translate("commands.wedit:thru.explain");
    }
  }
  return RawText.translate("commands.wedit:ascend.obstructed");
}

registerCommand(registerInformation, function (session, builder, args) {
  const levels = args.get("levels") as number;

  for (let level = 0; level < levels; level++) {
    ascend(builder);
  }

  return RawText.translate("commands.wedit:thru.explain");
});
