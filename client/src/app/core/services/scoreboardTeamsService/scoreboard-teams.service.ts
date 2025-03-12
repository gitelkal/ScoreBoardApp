import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { ScoreboardTeams } from '@app/shared/models/scoreboardTeams.model';
import { Observable } from 'rxjs';
import { ScoreboardTeamsResponseOne } from '@app/shared/models/scoreboardTeamsOne.model';

@Injectable({
  providedIn: 'root'
})
export class ScoreboardTeamsService {

  private readonly api: string;

  constructor(private http: HttpClient, private apiService: ApiService) {
    this.api = this.apiService.api;
  }
  getScoreboardWithTeam(): Observable<ScoreboardTeams[]> {
    return this.http.get<ScoreboardTeams[]>(`${this.api}/ScoreboardTeams/`);
  }
  getOneScoreboardTeam(id: number): Observable<ScoreboardTeamsResponseOne[]> {
    return this.http.get<ScoreboardTeamsResponseOne[]>(`${this.api}/ScoreboardTeams/${id}`);
  }
  setScoreboardTeamPoints(scoreboardId: string, teamId : number, points : number)
  {
    return this.http.put<any>(`${this.api}/ScoreboardTeams/${scoreboardId}/${teamId}/points?points=${points}`, { responseType: 'json' });
  }

  getUserTeamsNotInScoreboard(scoreboardId: number, userId: number){
    return this.http.get<any>(`${this.api}/ScoreboardTeams/${scoreboardId}/userId?userId=${userId}`, { responseType: 'json' });
  }
  addTeamToScoreboard(scoreboardId: number, teamId: number)
  {
    console.log(`${this.api}/ScoreboardTeams?scoreboardId=${scoreboardId}&teamId=${teamId}`)
    return this.http.post<any>(`${this.api}/ScoreboardTeams?scoreboardId=${scoreboardId}&teamId=${teamId}`, { responseType: 'json' });
  }
}
