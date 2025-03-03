import { Injectable } from '@angular/core';
import { Users } from '../../../shared/models/users.model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../api/api.service';
import { ScoreboardBasic } from '../../../shared/models/scoreboardBasic.model';

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

  public getOneUser(id: string): Observable<Users> {
    return this.http.get<Users>(`${this.api}/users/${id}`);
  }

  public getUserScoreboards(id: string): Observable<ScoreboardBasic[]> {
    return this.http.get<ScoreboardBasic[]>(`${this.api}/users/${id}/scoreboards`);
}
}
