import { Component, inject, OnInit } from '@angular/core';
import { TeamService } from '@app/core/services/teamService/team.service';
import { ScoreboardService } from '@app/core/services/ScoreboardService/scoreboard.service';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RouterLink } from '@angular/router';
import { TeamUsersService } from '@app/core/services/teamUsersService/team-users.service';
import { AuthService } from '@app/core/services/auth/auth.service';
import { Observable } from 'rxjs';
import { SignalRService } from '@app/core/services/signalRService/signal-r.service';
import { TeamUsers } from '@app/shared/models/teamUser.model';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [NgIf, NgFor, AsyncPipe, RouterLink],
  templateUrl: './team.component.html',
  styleUrl: './team.component.css'
})
export class TeamComponent implements OnInit {

  constructor(private signalRService: SignalRService) {
    this.getAllTeamUsers$.subscribe({
      next: (response) => {
        response.forEach((team) => {
          this.usersInTeam.push({ teamID: team.team.teamID, userIDs: team.users.map((user) => Number(user.userId)) });
          if (team.users.map((team) => Number(team.userId)).includes(this.userID)) {
          }
        });
      },
    });
  }
  
  ngOnInit(): void {
      this.signalRService.startConnection();
      this.subscribeToTeamUserUpdates();
  }

  authService = inject(AuthService);
  teamService = inject(TeamService);
  teamUsersService = inject(TeamUsersService);
  scoreboardService = inject(ScoreboardService);
  route = inject(ActivatedRoute);

  isAdmin: Observable<boolean> = this.authService.isAdmin;
  getAllTeamUsers$ = this.teamUsersService.getTeamWithUsers();
  usersInTeam: { teamID: number; userIDs: number[] }[] = [];

  joinTeam(userID: number, teamID: number): void {
    this.teamUsersService.joinTeam(userID, teamID).subscribe({
      next: () => {
        this.usersInTeam.push({ teamID: teamID, userIDs: [userID] });
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

  subscribeToTeamUserUpdates() {
    this.signalRService.userJoinTeamUpdates.subscribe((update) => {
      if (update) {
        this.getAllTeamUsers$ = this.teamUsersService.getTeamWithUsers();
        this.usersInTeam = this.usersInTeam.map((team) => {
          if (team.teamID === update.teamId) {
            return { teamID: team.teamID, userIDs: [...team.userIDs, Number(update.userId)] };
          }
          return team;
        });
      }
    });
  }
}

