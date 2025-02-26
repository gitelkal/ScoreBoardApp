export interface TeamUsers {
    team: {
        teamID: number;
        teamName: string;
      };
    users: {
    userId: number;
    userName: string;
    passwordHash: string;
    }[];
}