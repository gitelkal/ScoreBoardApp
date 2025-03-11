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
}
