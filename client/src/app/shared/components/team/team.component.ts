import { Component, inject } from '@angular/core';
import { TeamService } from '@app/core/services/teamService/team.service';
import { ScoreboardService } from '@app/core/services/scoreboardService/scoreboard.service';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RouterLink } from '@angular/router';
import { TeamUsersService } from '@app/core/services/teamUsersService/team-users.service';
import { AuthService } from '@app/core/services/auth/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [NgIf, NgFor, AsyncPipe, RouterLink],
  templateUrl: './team.component.html',
  styleUrl: './team.component.css'
})
export class TeamComponent {
  authService = inject(AuthService);
  teamService = inject(TeamService);
  teamUsersService = inject(TeamUsersService);
  isAdmin: Observable<boolean> = this.authService.isAdmin;

  getAllTeamUsers$ = this.teamUsersService.getTeamWithUsers();
  getAllTeams$ = this.teamService.getAllTeams();
  getOneTeam$ = this.teamService.getOneTeam('some-id');

  scoreboardService = inject(ScoreboardService);
  
  route = inject(ActivatedRoute);

}

