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
  providedIn: 'root'
})
export class ScoreboardService {
  private readonly api: string;

  constructor(private http: HttpClient, private apiService: ApiService) {
    this.api = this.apiService.api;
  }

  // ------------------------------------
  public createScoreboard(scoreboard: Scoreboards): Observable<Scoreboards> {
    console.log('🚀 Skickar PUT till API:', this.api + '/scoreboards');

    return this.http.post<Scoreboards>(`${this.api}/scoreboards`, scoreboard);
  }


updateScoreboard(id: string, updatedScoreboard: any) {
  console.log("API URL för PUT:", `${this.api}/scoreboards/${id}`);

  return this.http.put<Scoreboards>(`${this.api}/scoreboards/${id}`, updatedScoreboard);
}
deleteScoreboard(scoreboardId: number): Observable<any> {
  return this.http.delete(`${this.api}/scoreboards/${scoreboardId}`);
}

  

  // ------------------------------------

  public getAllScoreboards(): Observable<Scoreboards[]> {
    return this.http.get<Scoreboards[]>(`${this.api}/scoreboards`);
  }

  public getOneScoreboard(id: string): Observable<Scoreboards> {
    return this.http.get<Scoreboards>(`${this.api}/scoreboards/${id}`);
  }

  public getRichScoreboard(id: string): Observable<ScoreboardResponse> {
    return this.http
      .get<ScoreboardResponse>(`${this.api}/scoreboards/rich/${id}`)
      .pipe(tap((response) => console.log('Service response:', response)));
  }

  public CreateAndAddEmptyTeamToScoreboard(scoreboardId: string, teamName: string) {
    const url = `${this.api}/ScoreboardTeams/${scoreboardId}/teamName?teamName=${teamName}`;
    console.log("API URL:", url);
    return this.http.post<any>(url, { responseType: 'json' });
}



}
