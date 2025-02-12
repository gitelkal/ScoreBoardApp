import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AdminService } from './core/services/AdminService/admin.service';
import { UserService } from './core/services/UserService/user.service';
import { ScoreboardService } from '../app/core/services/ScoreboardService/scoreboard.service';
import { TeamService } from './core/services/TeamService/team.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { HeaderComponent } from './shared/components/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true, 
  imports: [HeaderComponent, RouterOutlet, MatButtonModule, MatIconModule, MatToolbarModule], 
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'client';
  http = inject(HttpClient);
  scoreboardService = inject(ScoreboardService);
  teamService = inject(TeamService);
  userService = inject(UserService);
  adminService = inject(AdminService);

  getAllScoreboards$ = this.scoreboardService.getAllScoreboards();
  getOneScoreboard$ = this.scoreboardService.getOneScoreboard('some-id');
  getRichScoreboard$ = this.scoreboardService.getRichScoreboard('some-id');
  getAllTeams$ = this.teamService.getAllTeams();
  getOneTeam$ = this.teamService.getOneTeam('some-id');
  getAllAdmins$ = this.adminService.getAllAdmins();
  getOneAdmin$ = this.adminService.getOneAdmin('some-id');
  getAllUsers$ = this.userService.getAllUsers();
  getOneUser$ = this.userService.getOneUser('some-id');

}

// @NgModule({
//   declarations: [
//     HeaderComponent
//   ],
//   exports: [
//     HeaderComponent
//   ]
// })
// export class AppModule { }