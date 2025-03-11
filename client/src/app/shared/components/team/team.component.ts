import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { TeamService } from '@app/core/services/teamService/team.service';
import { NgIf, NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TeamUsersService } from '@app/core/services/teamUsersService/team-users.service';
import { AuthService } from '@app/core/services/auth/auth.service';
import { Observable, Subscription } from 'rxjs';
import { SignalRService } from '@app/core/services/signalRService/signal-r.service';
import { UserService } from '@app/core/services/userService/user.service';

@Component({
  selector: 'app-team',
  imports: [NgIf, NgFor, RouterLink],
  templateUrl: './team.component.html',
  styleUrl: './team.component.css'
})
export class TeamComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  teamService = inject(TeamService);
  teamUsersService = inject(TeamUsersService);
  signalRService = inject(SignalRService);
  cdr = inject(ChangeDetectorRef);
  userService = inject(UserService);

  isAdmin: Observable<boolean> = this.authService.isAdmin;
  loggedInUsername = this.authService.getUsername();
  getAllTeamUsers$ = this.teamUsersService.getTeamWithUsers();
  userID = this.authService.getUserID() ?? 0;
  usersInTeam: { teamID: number; userIDs: number[] }[] = [];
  teamsList: { teamID: number; teamName: string }[] = [];
  usersList: { userID: number; username: string }[] = [];
  hoveredTeamID: number | null = null;

  private teamSubscription: Subscription | undefined;
  private joinUpdateSubscription: Subscription | undefined;
  private leaveUpdateSubscription: Subscription | undefined;

  constructor() {
    this.loadTeamData();
  }

  ngOnInit(): void {
    this.signalRService.startConnection();
    this.subscribeToTeamUserUpdates();
  }

  ngOnDestroy(): void {
    this.teamSubscription?.unsubscribe();
    this.joinUpdateSubscription?.unsubscribe();
    this.leaveUpdateSubscription?.unsubscribe();
  }

  loadTeamData() {
    this.teamSubscription = this.getAllTeamUsers$.subscribe({
      next: (response) => {
        this.usersInTeam = response.map(team => ({
          teamID: team.team.teamID,
          userIDs: team.users.map(user => Number(user.userId))
        }));

        this.teamsList = response.map(team => ({
          teamID: team.team.teamID,
          teamName: team.team.teamName
        }));

        this.userService.getAllUsers().subscribe(users => {
          this.usersList = users.map(user => ({
            userID: Number(user.userId),
            username: user.username
          }));
        });
      },
    });
  }

  joinTeam(userID: number, teamID: number): void {
    this.teamUsersService.joinTeam(userID, teamID).subscribe();
  }

  dropFromTeam(userID: number, teamID: number): void {
    this.teamUsersService.removeUserFromTeam(teamID, userID).subscribe();
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
    this.joinUpdateSubscription = this.signalRService.userJoinTeamUpdates.subscribe(update => {
      if (update) {
        if (this.isUserInTeam(update.teamId, update.userId)) return;
        this.usersInTeam = this.usersInTeam.map(team =>
          team.teamID === update.teamId ? { ...team, userIDs: [...team.userIDs, Number(update.userId)] } : team
        );
        this.cdr.detectChanges();
      }
    });

    this.leaveUpdateSubscription = this.signalRService.userLeftTeamUpdates.subscribe(update => {
      if (update) {
        this.usersInTeam = this.usersInTeam.map(team =>
          team.teamID === update.teamId ? { ...team, userIDs: team.userIDs.filter(id => id !== Number(update.userId)) } : team
        );
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
