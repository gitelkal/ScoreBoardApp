import { Injectable } from '@angular/core';
import { Teams } from '../../../shared/models/teams.models';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root',
})
export class TeamService {
  private readonly api: string;

  constructor(private http: HttpClient, private apiService: ApiService) {
    this.api = this.apiService.api;
  }

  // Hämta alla lag
  public getAllTeams(): Observable<Teams[]> {
    return this.http.get<Teams[]>(`${this.api}/teams`);
  }

  // Hämta ett enskilt lag
  public getOneTeam(id: string): Observable<Teams> {
    return this.http.get<Teams>(`${this.api}/teams/${id}`);
  }

  // Skapa ett nytt lag
  public createTeam(team: { teamName: string }): Observable<any> {
    return this.http.post<any>(`${this.api}/Teams`, team, {
      responseType: 'json',
    });
  }
  

  // Ta bort ett lag
  public deleteTeam(teamId: number): Observable<any> {
    return this.http.delete(`${this.api}/teams/${teamId}`);
  }

  public getTeamWithUsers(): Observable<any> {
    return this.http.get<any>(`${this.api}/TeamUsers/`);
  }

  public updateTeam(teamId: number, updatedTeam: any): Observable<any> {
    return this.http.put(`${this.api}/teams/${teamId}`, updatedTeam);
  }

  addUserToTeam(teamID: number, user: any): Observable<any> {
    return this.http.post<any>(`/api/teams/${teamID}/users`, user);
  }

  removeUserFromTeam(teamID: number, user: any): Observable<any> {
    return this.http.delete<any>(`/api/teams/${teamID}/users/${user.id}`);
  }
}
