import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { Observable } from 'rxjs';
import { TeamUsers } from '@app/shared/models/teamUser.model';
import { DropUserFromTeamRequest } from '@app/interfaces/drop-user-from-team-request';

@Injectable({
  providedIn: 'root'
})
export class TeamUsersService {
  private readonly api: string;

  constructor(private http: HttpClient, private apiService: ApiService) {
    this.api = this.apiService.api;
  }
  public async getTeamWithUsers(): Promise<TeamUsers[]> {
    try {
      const teamUsers = await this.http.get<TeamUsers[]>(`${this.api}/TeamUsers/`).toPromise();
      return teamUsers || []; // Return an empty array if teamUsers is null
    } catch (error) {
      console.error('Error fetching teams with users', error);
      throw error;
    }
  }

  public async getOneTeamWithUsers(id: number): Promise<TeamUsers> {
    try {
      const teamUser = await this.http.get<TeamUsers>(`${this.api}/TeamUsers/${id}`).toPromise();
      return teamUser || {} as TeamUsers;
    } catch (error) {
      console.error(`Error fetching team with users with id ${id}`, error);
      throw error;
    }
  }
  joinTeam(userId: number, teamID: number): Observable<any> {
    return this.http.post(`${this.api}/teamusers`, {userId: userId, teamID: teamID});
  }
  removeUserFromTeam(teamId: number, userId: number): Observable<DropUserFromTeamRequest> {
    const body = { teamId, userId };
    return this.http.delete<DropUserFromTeamRequest>(`${this.api}/teamusers/`, { body });
  }
  
}
