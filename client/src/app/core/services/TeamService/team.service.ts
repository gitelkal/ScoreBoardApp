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
  public async getAllTeams(): Promise<Teams[]> {
    try {
      const teams = await this.http.get<Teams[]>(`${this.api}/teams`).toPromise();
      if (!teams) {
        throw new Error('Failed to fetch teams');
      }
      return teams;
    } catch (error) {
      console.error('Error fetching all teams', error);
      throw error;
    }
  }

  public async getOneTeam(id: string): Promise<Teams> {
    try {
      const team = await this.http.get<Teams>(`${this.api}/teams/${id}`).toPromise();
      if (!team) {
        throw new Error(`Failed to fetch team with id ${id}`);
      }
      return team;
    } catch (error) {
      console.error(`Error fetching team with id ${id}`, error);
      throw error;
    }
  }

  public async getTeamWithUsers(): Promise<any> {
    try {
      const userTeams = await this.http.get<any>(`${this.api}/TeamUsers/`).toPromise();
      return userTeams || []; // Return an empty array if userTeams is null
    } catch (error) {
      console.error('Error fetching teams with users', error);
      throw error;
    }
  }

  // Skapa ett nytt lag
  public createTeam(team: { teamName: string }): Observable<any> {
    return this.http.post<any>(`${this.api}/Teams`, team,);
  }

  // Ta bort ett lag
  public deleteTeam(teamId: number): Observable<any> {
    return this.http.delete(`${this.api}/teams/${teamId}`);
  }


  public updateTeam(teamId: number, updatedTeam: any): Observable<any> {
    return this.http.put(`${this.api}/teams/${teamId}`, updatedTeam);
  }

  addUserToTeam(teamID: number, user: any): Observable<any> {
    return this.http.post<any>(`/api/teams/${teamID}/users`, user);
  }
}
