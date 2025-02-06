import { Component, OnInit } from '@angular/core';
import { Team } from '../app/models/team.model';
import { RouterOutlet } from '@angular/router';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTableModule } from '@angular/material/table';
import { HomeComponent } from './home/home.component';
import { Admin } from '../app/models/admin.model';
import { User } from '../app/models/user.model';
import { Home } from '../app/models/home.model'

@Component({
  selector: 'app-root',
  templateUrl: './/app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title(title: any) {
    throw new Error('Method not implemented.');
  }
  teams: Team[] = [
    new Team(1, 'Team A', 10),
    new Team(2, 'Team B', 15),
    new Team(3, 'Team C', 20)
  ];

  constructor() {}

  ngOnInit(): void {}

  updateScore() {
    const randomTeam = this.teams[Math.floor(Math.random() * this.teams.length)];
    randomTeam.points += Math.floor(Math.random() * 10);
  }
}

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatTableModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }