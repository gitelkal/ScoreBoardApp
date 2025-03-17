import { Injectable } from '@angular/core';
import { Users } from '../../../shared/models/users.model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../api/api.service';
import { ScoreboardBasic } from '../../../shared/models/scoreboardBasic.model';
import { Teams } from '../../../shared/models/teams.models';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly api: string;

  constructor(private http: HttpClient, private apiService: ApiService) {
    this.api = this.apiService.api;
  }

  public async getAllUsers(): Promise<Users[]> {
    try {
      const users = await this.http.get<Users[]>(`${this.api}/users`).toPromise();
      if (!users) {
        throw new Error('Failed to fetch users');
      }
      return users;
    } catch (error) {
      console.error('Error fetching all users', error);
      throw error;
    }
  }

  public async getOneUser(id: number): Promise<Users> {
    try {
      const user = await this.http.get<Users>(`${this.api}/users/${id}`).toPromise();
      if (!user) {
        throw new Error(`User with id ${id} not found`);
      }
      return user;
    } catch (error) {
      console.error(`Error fetching user with id ${id}`, error);
      throw error;
    }
  }

  public async getUserScoreboards(id: number): Promise<ScoreboardBasic[]> {
    try {
      const scoreboards = await this.http.get<ScoreboardBasic[]>(`${this.api}/userscoreboards/${id}/scoreboards`).toPromise();
      if (!scoreboards) {
        throw new Error(`Failed to fetch scoreboards for user with id ${id}`);
      }
      return scoreboards;
    } catch (error) {
      console.error(`Error fetching scoreboards for user with id ${id}`, error);
      throw error;
    }
  }

  public async getUserTeams(id: number): Promise<Teams[]> {
    try {
      const teams = await this.http.get<Teams[]>(`${this.api}/teamusers/${id}/teams`).toPromise();
      if (!teams) {
        throw new Error(`Failed to fetch teams for user with id ${id}`);
      }
      return teams;
    } catch (error) {
      console.error(`Error fetching teams for user with id ${id}`, error);
      throw error;
    }
  }

  public deleteUser(id: number): Observable<Users> {
    return this.http.delete<Users>(`${this.api}/users/${id}`);
  }
}
