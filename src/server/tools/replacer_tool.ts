import { Vector3, Player } from "@minecraft/server";
import { PlayerSession } from "../sessions.js";
import { Tool } from "./base_tool.js";
import { Tools } from "./tool_manager.js";
import { Pattern } from "@modules/pattern.js";

class BlockReplacerTool extends Tool {
  public pattern: Pattern;

  noDelay = true;
  permission = "worldedit.repl";
  useOn = function (self: BlockReplacerTool, player: Player, session: PlayerSession, loc: Vector3) {
    if (player.isSneaking) {
      self.breakOn(self, player, session, loc);
    } else {
      self.pattern.setBlock(player.dimension.getBlock(loc));
    }
  };

  breakOn = function (self: BlockReplacerTool, player: Player, session: PlayerSession, loc: Vector3) {
    self.pattern = new Pattern();
    self.pattern.addBlock(player.dimension.getBlock(loc).permutation);
  };

  constructor(pattern: Pattern) {
    super();
    this.pattern = pattern;
  }
}
Tools.register(BlockReplacerTool, "replacer_wand");
