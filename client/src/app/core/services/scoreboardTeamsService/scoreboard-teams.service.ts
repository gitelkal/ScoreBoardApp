import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { ScoreboardTeams } from '@app/shared/models/scoreboardTeams.model';
import { Observable, tap } from 'rxjs';
import { ScoreboardTeamsResponseOne } from '@app/shared/models/scoreboardTeamsOne.model';
import { catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScoreboardTeamsService {

  private readonly api: string;

  constructor(private http: HttpClient, private apiService: ApiService) {
    this.api = this.apiService.api;
  }
  public async getScoreboardWithTeam(): Promise<ScoreboardTeams[]> {
    try {
      const scoreboardTeams = await this.http.get<ScoreboardTeams[]>(`${this.api}/ScoreboardTeams/`).toPromise();
      if (!scoreboardTeams) {
        throw new Error('No scoreboard teams found');
      }
      return scoreboardTeams;
    } catch (error) {
      console.error('Error fetching scoreboard teams', error);
      throw error;
    }
  }

  public async getOneScoreboardTeam(id: number): Promise<ScoreboardTeamsResponseOne[]> {
    try {
      const scoreboardTeam = await this.http.get<ScoreboardTeamsResponseOne[]>(`${this.api}/ScoreboardTeams/${id}`).toPromise();
      if (!scoreboardTeam) {
        throw new Error(`Scoreboard team with id ${id} not found`);
      }
      return scoreboardTeam;
    } catch (error) {
      console.error(`Error fetching scoreboard team with id ${id}`, error);
      throw error;
    }
  }

  public async getUserTeamsNotInScoreboard(scoreboardId: number, userId: number): Promise<any> {
    try {
      const userTeams = await this.http.get<any>(`${this.api}/ScoreboardTeams/${scoreboardId}/userId?userId=${userId}`, { responseType: 'json' }).toPromise();
      return userTeams;
    } catch (error) {
      console.error(`Error fetching user teams not in scoreboard with scoreboardId ${scoreboardId} and userId ${userId}`, error);
      throw error;
    }
  }
  givePointsToTeam(scoreboardId: number, teamId: number, points: number) {
    return this.http.put(`${this.api}/ScoreboardTeams/${scoreboardId}/${teamId}/addPoints?points=${points}`, { responseType: 'json' });
  }
  setScoreboardTeamPoints(scoreboardId: string, teamId : number, points : number)
  {
    return this.http.put<any>(`${this.api}/ScoreboardTeams/${scoreboardId}/${teamId}/points?points=${points}`, { responseType: 'json' });
  }

  addTeamToScoreboard(scoreboardId: number, teamId: number)
  {
    return this.http.post<any>(`${this.api}/ScoreboardTeams?scoreboardId=${scoreboardId}&teamId=${teamId}`, { responseType: 'json' });
  }
  removeTeamFromScoreboard(scoreboardId: number, teamId: number)
  {
    return this.http.delete<any>(`${this.api}/ScoreboardTeams/${scoreboardId}/teamId?teamId=${teamId}`, { responseType: 'json' });
  }
  public updateTasksForTeam(scoreboardId: number, teamId: number, tasksCount: number): Observable<any> {
    return this.http.put(`${this.api}/ScoreboardTeams/${scoreboardId}/${teamId}/tasks`, { TasksCount: Number(tasksCount) });
  }
  public getTasksForTeam(scoreboardId: number, teamId: number): Observable<any> {
    return this.http.get<number>(`${this.api}/ScoreboardTeams/${scoreboardId}/${teamId}/tasks`)
  }
}
