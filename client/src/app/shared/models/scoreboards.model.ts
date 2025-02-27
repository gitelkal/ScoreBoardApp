export interface Scoreboards {
    scoreboardId?: number;  // Gör ID valfritt
    name: string;
    startedAt: string;
    endedAt: string;
    active: boolean;
    description?: string;  // Gör description valfritt om det inte alltid behövs
  }
  
