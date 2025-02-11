import { Injectable } from '@angular/core';
import { Scoreboards } from '../../../shared/models/scoreboards.model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root'
})
export class ScoreboardService {

  private readonly api: string;

  constructor(private http: HttpClient, private apiService: ApiService) {
    this.api = this.apiService.api;
  }

  public getAllScoreboards(): Observable<Scoreboards[]> {
    return this.http.get<Scoreboards[]>(`${this.api}/scoreboards`);
  }

  public getOneScoreboard(id: string): Observable<Scoreboards> {
    return this.http.get<Scoreboards>(`${this.api}/scoreboards/${id}`);
  }

}
