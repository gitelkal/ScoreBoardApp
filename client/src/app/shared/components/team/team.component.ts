import { Component, inject } from '@angular/core';
import { TeamService } from '@app/core/services/teamService/team.service';
import { ScoreboardService } from '@app/core/services/scoreboardService/scoreboard.service';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RouterLink } from '@angular/router';
import { TeamUsersService } from '@app/core/services/teamUsersService/team-users.service';
import { AuthService } from '@app/core/services/auth/auth.service';
import { BehaviorSubject, Observable } from 'rxjs';

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
  scoreboardService = inject(ScoreboardService);
  route = inject(ActivatedRoute);

  isAdmin: Observable<boolean> = this.authService.isAdmin;
  getAllTeamUsers$ = this.teamUsersService.getTeamWithUsers();
  getAllTeams$ = this.teamService.getAllTeams();
  getOneTeam$ = this.teamService.getOneTeam('some-id');
  usersInTeam: { teamID: number; userIDs: number[] }[] = [];

  constructor() {
    this.getAllTeamUsers$.subscribe({
      next: (response) => {
        response.forEach((team) => {
          this.usersInTeam.push({ teamID: team.team.teamID, userIDs: team.users.map((user) => user.userId) });
          if (team.users.map((team) => team.userId).includes(this.userID)) {
          }
        });
      },
    });
    }

  joinTeam(userID: number, teamID: number): void {
    this.teamUsersService.joinTeam(userID, teamID).subscribe({
      next: (response) => {
        this.usersInTeam.push({ teamID: teamID, userIDs: [userID] });
        console.log('Användare ' + userID + ' har lagts till i lag ' + teamID);
      },
    });
  }
  get userID(): number {
    return this.authService.getUserID() ?? 0;  
  }
  isUserInTeam(teamID: number, userID: number): boolean {
    const team = this.usersInTeam.find(t => t.teamID === teamID);
    return team ? team.userIDs.includes(userID) : false;
  }
}

