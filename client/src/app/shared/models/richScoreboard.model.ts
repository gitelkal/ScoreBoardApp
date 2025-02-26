

export interface RichScoreboard {
    scoreboardId: number;
    name: string;
    startedAt: Date;
    endedAt?: Date; 
    active: boolean;
    teams: RichTeam[];  
}

export interface RichTeam {
    teamID: number;
    teamName: string;
    points: number;
    lastUpdated: Date;
    users: RichUser[];
}

export interface RichUser {
    userId: number;
    userName: string;
}


export interface ScoreboardTeams {
    scoreboardTeamId: number;
    scoreboardId: number;
    teamId: number;
    points: number;
    lastUpdated: Date;
    users: TeamUsers[]; 
}

export interface TeamUsers {
    teamUserId: number;
    teamId: number; 
    userId: number;
}

export interface ScoreboardResponse {
    scoreboard: RichScoreboard;
}

export interface Scoreboard {
    scoreboardId: number;
    name: string;
    description: string;
    startedAt: Date;
    endedAt: Date;
    active: boolean;
    teams: RichTeam[];
}

