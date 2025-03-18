import { Injectable } from '@angular/core';
import { Scoreboards } from '../../../shared/models/scoreboards.model';
import { Observable, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../api/api.service';
import { tap } from 'rxjs/operators';
import { RichScoreboard } from '@app/shared/models/richScoreboard.model';
import { ScoreboardResponse } from '../../../shared/models/richScoreboard.model';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ScoreboardService {
  private readonly api: string;

  constructor(private http: HttpClient, private apiService: ApiService) {
    this.api = this.apiService.api;
  }

  public createScoreboard(scoreboard: Scoreboards): Observable<Scoreboards> {
    return this.http.post<Scoreboards>(`${this.api}/scoreboards`, scoreboard);
  }

  updateScoreboard(id: string, updatedScoreboard: any) {
    return this.http.put<Scoreboards>(`${this.api}/scoreboards/${id}`,updatedScoreboard);
  }

  deleteScoreboard(scoreboardId: number): Observable<any> {
    return this.http.delete(`${this.api}/scoreboards/${scoreboardId}`);
  }

  public async getAllScoreboards(): Promise<Scoreboards[]> {
    try {
      const scoreboards = await this.http.get<Scoreboards[]>(`${this.api}/scoreboards`).toPromise();
      return scoreboards || [];
    } catch (error) {
      console.error('Error fetching all scoreboards', error);
      throw error;
    }
  }

  public async getOneScoreboard(id: string): Promise<Scoreboards> {
    try {
      const scoreboard = await this.http.get<Scoreboards>(`${this.api}/scoreboards/${id}`).toPromise();
      if (!scoreboard) {
        throw new Error(`Scoreboard with id ${id} not found`);
      }
      return scoreboard;
    } catch (error) {
      console.error(`Error fetching scoreboard with id ${id}`, error);
      throw error;
    }
  }

  public async getRichScoreboard(id: string): Promise<ScoreboardResponse> {
    try {
      const richScoreboard = await this.http.get<ScoreboardResponse>(`${this.api}/scoreboards/rich/${id}`).toPromise();
      if (!richScoreboard) {
        throw new Error(`Rich scoreboard with id ${id} not found`);
      }
      return richScoreboard;
    } catch (error) {
      console.error(`Error fetching rich scoreboard with id ${id}`, error);
      throw error;
    }
  }

  public CreateAndAddEmptyTeamToScoreboard(
    scoreboardId: string,
    teamName: string
  ) {
    const url = `${this.api}/ScoreboardTeams/${scoreboardId}/teamName?teamName=${teamName}`;
    console.log('API URL:', url);
    return this.http.post<any>(url, { responseType: 'json' });
  }
  public addTeamToScoreboard(scoreboardId: number, teamId: number): Observable<any> {
    return this.http.post(`${this.api}/ScoreboardTeams?scoreboardId=${scoreboardId}&teamId=${teamId}`, {});
  }
  public removeTeamFromScoreboard(scoreboardId: number, teamId: number): Observable<any> {
    return this.http.delete(`${this.api}/ScoreboardTeams?scoreboardId=${scoreboardId}&teamId=${teamId}`);
  }
  public updateNumberOfTasks(scoreboardId: number, numberOfTasks: number): Observable<any> {
    return this.http.put(`${this.api}/scoreboards/${scoreboardId}/numberOfTasks`, { NumberOfTasks: numberOfTasks });
  }
  public getNumberOfTasks(scoreboardId: number): Observable<number> {
    return this.http.get<number>(`${this.api}/scoreboards/${scoreboardId}/numberOfTasks`);
  }
}
