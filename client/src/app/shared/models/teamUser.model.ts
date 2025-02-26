export interface TeamUsers {
    team: {
        teamID: number;
        teamName: string;
      };
    users: {
    userId: number;
    username: string;
    passwordHash: string;
    }[];
}