import { Player, BlockLocation, TickEvent, Location, BlockPermutation, TicksPerSecond } from 'mojang-minecraft';
import { History } from './modules/history.js';
import { getPlayerDimension, printDebug, printLocation, regionMax, regionMin, regionSize } from './util.js';
import { Server } from '../library/Minecraft.js';
import { Pattern } from './modules/pattern.js';
import { Regions } from './modules/regions.js';

// TODO: Add other selection modes
type selectMode = 'cuboid';

const TIME_TO_DELETE_SESSION = 600 * TicksPerSecond;

const playerSessions: {[k: string]: PlayerSession} = {};
const pendingDeletion: {[k: string]: [number, PlayerSession]} = {}

Server.on('tick', ev => {
    for (const player in pendingDeletion) {
        const session = pendingDeletion[player];
        session[0]--;
        if (session[0] < 0) {
            session[1].delete();
            delete pendingDeletion[player];
            printDebug('Deleted player session!');
        }
    }
});

export class PlayerSession {
    public usePickerPattern = false;

    private player: Player;
    private history: History;
    private selectionPoints: BlockLocation[];

    private _selectionMode: selectMode = 'cuboid';
    private _drawSelection = true;
    
    private pickerPattern: BlockPermutation[] = [];

    private drawPoints: Location[] = [];
    private drawTimer: number = 0;
    private onTick = (tick: TickEvent) => {
        if (!this.drawSelection) return;
        if (this.drawTimer <= 0) {
            this.drawTimer = 10;
            const dimension = getPlayerDimension(this.player)[1];
            for (const point of this.drawPoints) {
                Server.runCommand(`particle wedit:selection_draw ${printLocation(point, false)}`, dimension);
            }
        }
        this.drawTimer--;
    }

    constructor(player: Player) {
        this.player = player;
        this.history = new History(this.player);
        this.selectionPoints = [];
        Server.on('tick', this.onTick);
    }

    public getPlayer() {
        return this.player;
    }

    public getHistory() {
        return this.history;
    }

    reassignPlayer(player: Player) {
        this.player = player;
        this.history.reassignPlayer(player);
    }

    public setSelectionPoint(index: number, loc: BlockLocation): void {
        if (this.selectionPoints.length <= index) {
            this.selectionPoints.length = index + 1;
        }
        this.selectionPoints[index] = loc;
        this.updateDrawSelection();
    }

    public getSelectionPoints() {
        return this.selectionPoints.slice();
    }

    public clearSelectionPoints() {
        this.selectionPoints.length = 0;
        this.updateDrawSelection();
    }

    public getBlocksSelected() {
        let points = 0;
        for (const point of this.selectionPoints) {
            if (point) points++;
        }
        if (points == 0 || points == 1)
            return [];

        if (this._selectionMode == 'cuboid') {
            const min = regionMin(this.selectionPoints[0], this.selectionPoints[1]);
            const max = regionMax(this.selectionPoints[0], this.selectionPoints[1]);
            return min.blocksBetween(max);
        }
    }
    
    public getSelectionRange(): [BlockLocation, BlockLocation] {
        if (this._selectionMode == 'cuboid') {
            const [pos1, pos2] = this.selectionPoints.slice(0, 2);
            return [regionMin(pos1, pos2), regionMax(pos1, pos2)];
        }
        return null;
    }

    private updateDrawSelection() {
        this.drawPoints.length = 0;
        if (this.selectionMode == 'cuboid' && this.selectionPoints.length == 2) {
            const min = regionMin(this.selectionPoints[0], this.selectionPoints[1]).offset(-0.5, 0, -0.5);
            const max = regionMax(this.selectionPoints[0], this.selectionPoints[1]).offset(-0.5, 0, -0.5);

            const corners = [
                new Location(min.x  , min.y  , min.z  ),
                new Location(max.x+1, min.y  , min.z  ),
                new Location(min.x  , max.y+1, min.z  ),
                new Location(max.x+1, max.y+1, min.z  ),
                new Location(min.x  , min.y  , max.z+1),
                new Location(max.x+1, min.y  , max.z+1),
                new Location(min.x  , max.y+1, max.z+1),
                new Location(max.x+1, max.y+1, max.z+1)
            ];

            const edgeData: [number, number][]= [
                [0, 1], [2, 3], [4, 5], [6, 7],
                [0, 2], [1, 3], [4, 6], [5, 7],
                [0, 4], [1, 5], [2, 6], [3, 7]
            ];
            const edgePoints: Location[] = [];
            for (const edge of edgeData) {
                const [a, b] = [corners[edge[0]], corners[edge[1]]];
                const d = [b.x - a.x + 1, b.y - a.y + 1, b.z - a.z + 1];
                const pointCount = Math.min(Math.floor(Math.sqrt(d[0]*d[0] + d[1]*d[1] + d[2]*d[2])), 32);
                for (let i = 1; i < pointCount; i++) {
                    let t = i / pointCount;
                    edgePoints.push(new Location(
                        (1.0 - t) * a.x + t * b.x,
                        (1.0 - t) * a.y + t * b.y,
                        (1.0 - t) * a.z + t * b.z
                    ));
                }
            }
            this.drawPoints = corners.concat(edgePoints);
            this.drawTimer = 0;
        }
    }

    public getPickerPatternParsed() {
        if (this.pickerPattern.length) {
            return Pattern.parseBlockPermutations(this.pickerPattern);
        }
    }

    public clearPickerPattern() {
        this.pickerPattern.length = 0;
    }

    public addPickerPattern(blockData: BlockPermutation) {
        this.pickerPattern.push(blockData);
    }

    delete() {
        Server.off('tick', this.onTick);
        Regions.deletePlayer(this.player);
        this.history = null;
    }

    /**
     * Getter selectionMode
     * @return {selectMode }
     */
	public get selectionMode(): selectMode  {
		return this._selectionMode;
	}

    /**
     * Setter selectionMode
     * @param {selectMode } value
     */
	public set selectionMode(value: selectMode ) {
		this._selectionMode = value;
	}
    
    /**
     * Getter drawSelection
     * @return {boolean }
     */
	public get drawSelection(): boolean  {
		return this._drawSelection;
	}

    /**
     * Setter drawSelection
     * @param {boolean } value
     */
	public set drawSelection(value: boolean ) {
		this._drawSelection = value;
        this.drawTimer = 0;
	}
}

export function getSession(player: Player): PlayerSession {
    const name = player.nameTag;
    if (!playerSessions[name]) {
        let session: PlayerSession
        if (pendingDeletion[name]) {
            session = pendingDeletion[name][1];
            session.reassignPlayer(player);
            delete pendingDeletion[name];
        }
        playerSessions[name] = session || new PlayerSession(player);
    }
    return playerSessions[name];
}

export function removeSession(player: string) {
    if (!playerSessions[player]) return;

    playerSessions[player].clearSelectionPoints();
    playerSessions[player].clearPickerPattern();
    pendingDeletion[player] = [TIME_TO_DELETE_SESSION, playerSessions[player]];
    delete playerSessions[player];
}