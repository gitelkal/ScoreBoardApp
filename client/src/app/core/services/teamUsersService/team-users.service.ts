import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { Observable } from 'rxjs';
import { TeamUsers } from '@app/shared/models/teamUser.model';

@Injectable({
  providedIn: 'root'
})
export class TeamUsersService {
  private readonly api: string;

  constructor(private http: HttpClient, private apiService: ApiService) {
    this.api = this.apiService.api;
  }
  getTeamWithUsers(): Observable<TeamUsers[]> {
    return this.http.get<TeamUsers[]>(`${this.api}/TeamUsers/`);
  }
  joinTeam(teamID: number, userID: number): Observable<any> {
    return this.http.post(`${this.api}`, { teamID, userID });
  }

}
