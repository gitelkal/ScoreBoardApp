export interface ScoreboardTeamsResponseOne {
    scoreboardId: number;
    name: string;
    description: string;
    startedAt: Date;
    endedAt: Date;
    active: boolean;
    points: number;
}
