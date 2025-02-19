import { Teams } from "./teams.models";

export interface RichScoreboard {
    scoreboardId: number;
    name: string;
    startedAt: Date;
    endedAt: Date;
    active: boolean;
}