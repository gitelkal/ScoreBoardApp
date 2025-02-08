import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Observable } from 'rxjs';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Scoreboards } from '../app/shared/models/scoreboards.model';
import { Teams } from '../app/shared/models/teams.models';
import { Admins } from '../app/shared/models/admins.model';
import { Users } from '../app/shared/models/users.model';

@Component({
  selector: 'app-root',
  standalone: true, 
  imports: [RouterOutlet, AsyncPipe, NgFor, NgIf], 
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'client';
  http = inject(HttpClient); 

  getAllScoreboards$ = this.getAllScoreboards();
  getOneScoreboard$ = this.getOneScoreboard();
  getAllTeams$ = this.getTeams();
  getOneTeam$ = this.getOneTeam();
  getAllAdmins$ = this.getAllAdmins();
  getOneAdmin$ = this.getOneAdmin();
  getAllUsers$ = this.getAllUsers();
  getOneUser$ = this.getOneUser();

  private getAllScoreboards(): Observable<Scoreboards[]> {
    return this.http.get<Scoreboards[]>('https://localhost:7062/api/scoreboards');
  }

  private getOneScoreboard(): Observable<Scoreboards> {
    return this.http.get<Scoreboards>('https://localhost:7062/api/scoreboards/{id}');
  }

  private getTeams(): Observable<Teams[]> {
    return this.http.get<Teams[]>('https://localhost:7062/api/teams');
  }

  private getOneTeam(): Observable<Teams> {
    return this.http.get<Teams>('https://localhost:7062/api/teams/{id}');
  }

  private getAllAdmins(): Observable<Admins[]> {
    return this.http.get<Admins[]>('https://localhost:7062/api/admins');
  }

  private getOneAdmin(): Observable<Admins> {
    return this.http.get<Admins>('https://localhost:7062/api/admins/{id}');
  }

  private getAllUsers(): Observable<Users[]> {
    return this.http.get<Users[]>('https://localhost:7062/api/users');
  }

  private getOneUser(): Observable<Users> {
    return this.http.get<Users>('https://localhost:7062/api/users/{id}');
  }
}
