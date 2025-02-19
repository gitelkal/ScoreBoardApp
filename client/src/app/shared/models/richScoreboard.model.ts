export interface RichScoreboard {
    scoreboardId: number;
    name: string;
    startedAt: Date;
    endedAt?: Date; // Optional since not all scoreboards may have an end date
    active: boolean;
    teams: RichTeam[];  
}

export interface RichTeam {
    teamId: number;
    teamName: string;
    points: number;
    lastUpdated: Date;
    users: RichUser[];
}

export interface RichUser {
    userId: number;
    userName: string;
}