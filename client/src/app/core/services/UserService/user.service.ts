import { Injectable } from '@angular/core';
import { Users } from '../../../shared/models/users.model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../api/api.service';
import { ScoreboardBasic } from '../../../shared/models/scoreboardBasic.model';
import { UserTeams } from '../../../shared/models/userTeams.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly api: string;

  constructor(private http: HttpClient, private apiService: ApiService) {
    this.api = this.apiService.api;
  }

  public getAllUsers(): Observable<Users[]> {
    return this.http.get<Users[]>(`${this.api}/users`);
  }

  public getOneUser(id: number): Observable<Users> {
    return this.http.get<Users>(`${this.api}/users/${id}`);
  }

  public getUserScoreboards(id: number): Observable<ScoreboardBasic[]> {
    return this.http.get<ScoreboardBasic[]>(`${this.api}/userscoreboards/${id}/scoreboards`);
  }

  public getUserTeams(id: number): Observable<UserTeams[]> {
    return this.http.get<UserTeams[]>(`${this.api}/teamusers/${id}/teams`);
  }
}
