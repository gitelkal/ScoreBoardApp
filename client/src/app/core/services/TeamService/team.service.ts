import { Injectable } from '@angular/core';
import { Teams } from '../../../shared/models/teams.models';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../api/api.service';
// import { inject } from '@angular/core/testing';

@Injectable({
  providedIn: 'root'
})
export class TeamService {

  private readonly api: string;

  constructor(private http: HttpClient, private apiService: ApiService) {
    this.api = this.apiService.api;
  }

  public getAllTeams(): Observable<Teams[]> {
    return this.http.get<Teams[]>(`${this.api}/teams`);
  }

  public getOneTeam(id: string): Observable<Teams> {
    return this.http.get<Teams>(`${this.api}/teams/${id}`);
  }


}
