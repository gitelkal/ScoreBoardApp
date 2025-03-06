import { Component, inject, OnInit } from '@angular/core';
import { TeamService } from '@app/core/services/teamService/team.service';
import { NgIf, NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TeamUsersService } from '@app/core/services/teamUsersService/team-users.service';
import { AuthService } from '@app/core/services/auth/auth.service';
import { Observable } from 'rxjs';
import { SignalRService } from '@app/core/services/signalRService/signal-r.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-team',
  imports: [NgIf, NgFor, RouterLink],
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.css']
})
export class TeamComponent implements OnInit {
  authService = inject(AuthService);
  teamService = inject(TeamService);
  teamUsersService = inject(TeamUsersService);
  signalRService = inject(SignalRService);
  cdr = inject(ChangeDetectorRef);

  isAdmin: Observable<boolean> = this.authService.isAdmin;
  getAllTeamUsers$ = this.teamUsersService.getTeamWithUsers();
  usersInTeam: { teamID: number; userIDs: number[] }[] = [];
  teamsList: { teamID: number; teamName: string }[] = [];
  usersList: { userID: number; username: string }[] = [];

  hoveredTeamID: number | null = null;

  constructor() {
    this.getAllTeamUsers$.subscribe({
      next: (response) => {
        response.forEach((team) => {
          this.usersInTeam.push({ teamID: team.team.teamID, userIDs: team.users.map((user) => Number(user.userId)) });
          this.teamsList.push({ teamID: team.team.teamID, teamName: team.team.teamName });
          team.users.forEach(user => {
            if (!this.usersList.some(u => u.userID === user.userId)) {
              this.usersList.push({ userID: Number(user.userId), username: user.username });
            }
          });
        });
      },
    });
  }

  ngOnInit(): void {
    this.signalRService.startConnection();
    this.subscribeToTeamUserUpdates();
  }

  joinTeam(userID: number, teamID: number): void {
    this.teamUsersService.joinTeam(userID, teamID).subscribe({
      next: () => {
        const team = this.usersInTeam.find(t => t.teamID === teamID);
        if (team && !team.userIDs.includes(userID)) {
          team.userIDs.push(userID);
        }
      },
    });
  }

  dropFromTeam(userID: number, teamID: number): void {
    this.teamUsersService.removeUserFromTeam(teamID, userID).subscribe({
      next: () => {
        this.usersInTeam = this.usersInTeam.map(team =>
          team.teamID === teamID ? { ...team, userIDs: team.userIDs.filter(id => id !== userID) } : team
        );
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

  getTeamName(teamID: number): string {
    const team = this.teamsList.find(t => t.teamID === teamID);
    return team ? team.teamName : 'Okänt lag';
  }

  getUsername(userID: number): string {
    const user = this.usersList.find(u => u.userID === userID);
    return user ? user.username : 'Okänd användare';
  }

  subscribeToTeamUserUpdates() {
    this.signalRService.userJoinTeamUpdates.subscribe(update => {
      if (update) {
        const currentTeamUsers = this.usersInTeam;

        const updatedTeams = currentTeamUsers.map(team =>
          team.teamID === update.teamId ? { ...team, userIDs: [...team.userIDs, Number(update.userId)] } : team
        );

        this.usersInTeam = updatedTeams;
        this.cdr.detectChanges();
      }
    });

    this.signalRService.userLeftTeamUpdates.subscribe(update => {
      if (update) {
        const currentTeamUsers = this.usersInTeam;

        const updatedTeams = currentTeamUsers.map(team =>
          team.teamID === update.teamId ? { ...team, userIDs: team.userIDs.filter(id => id !== Number(update.userId)) } : team
        );

        this.usersInTeam = updatedTeams;
        this.cdr.detectChanges();
      }
    });
  }

  onJoinMouseEnter(teamID: number) {
    this.hoveredTeamID = teamID;
  }

  onJoinMouseLeave() {
    if (this.hoveredTeamID !== null) {
      this.hoveredTeamID = null;
    }
  }

  onLeaveMouseEnter(teamID: number) {
    this.hoveredTeamID = teamID;
  }

  onLeaveMouseLeave() {
    if (this.hoveredTeamID !== null) {
      this.hoveredTeamID = null;
    }
  }

  getJoinButtonText(teamID: number): string {
    return this.hoveredTeamID === teamID ? 'Gå ur lag' : 'Gå med i lag';
  }

  getLeaveButtonText(teamID: number): string {
    return this.hoveredTeamID === teamID ? 'Gå ur lag' : 'Du tillhör detta lag';
  }
}
