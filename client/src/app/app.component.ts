import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Observable } from 'rxjs';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Scoreboards } from '../models/scoreboards.model';
import { Teams } from '../models/teams.models';
import { Admins } from '../models/admins.model';

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

  scoreboards$ = this.getScoreboards();
  teams$ = this.getTeams();
  admins$ = this.getAdmins();

  private getScoreboards(): Observable<Scoreboards[]> {
    return this.http.get<Scoreboards[]>('https://localhost:7062/api/scoreboards');
  }

  private getTeams(): Observable<Teams[]> {
    return this.http.get<Teams[]>('https://localhost:7062/api/teams');
  }

  private getAdmins(): Observable<Admins[]> {
    return this.http.get<Admins[]>('https://localhost:7062/api/admins');
  }
}
