import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { TeamService } from '@app/core/services/teamService/team.service';
import { NgIf, NgFor } from '@angular/common';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { TeamUsersService } from '@app/core/services/teamUsersService/team-users.service';
import { AuthService } from '@app/core/services/auth/auth.service';
import { Observable, Subscription } from 'rxjs';
import { SignalRService } from '@app/core/services/signalRService/signal-r.service';
import { UserService } from '@app/core/services/userService/user.service';
import { Teams } from '@app/shared/models/teams.models';
import { Users } from '@app/shared/models/users.model';
import { UserTeamsList } from '@app/shared/models/userTeamList.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-team',
  imports: [NgIf, NgFor, RouterLink, FormsModule],
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
  router = inject(Router);

  isAdmin: Observable<boolean> = this.authService.isAdmin;
  loggedInUsername = this.authService.getUsername();
  userID = this.authService.getUserID() ?? 0;
  query: string = '';
  filteredTeams: UserTeamsList[] = [];
  usersInTeam: UserTeamsList[] = [];
  usersList: Users  [] = [];
  teamsList: Teams[] = [];
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
        this.router.events.subscribe(event => {
          if (event instanceof NavigationEnd) {
            window.scrollTo(0, 0);
          }
        });
  }

  ngOnDestroy(): void {
    this.teamSubscription?.unsubscribe();
    this.joinUpdateSubscription?.unsubscribe();
    this.leaveUpdateSubscription?.unsubscribe();
  }

  loadTeamData() {
    this.teamSubscription = this.teamUsersService.getTeamWithUsers().subscribe({
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
            userId: Number(user.userId),
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname
          }));
        });
        this.filterTeams()
      },
    });
  }

  joinTeam(userID: number, teamID: number): void {
    this.teamUsersService.joinTeam(userID, teamID).subscribe();
    this.filterTeams()
  }

  dropFromTeam(userID: number, teamID: number): void {
    this.teamUsersService.removeUserFromTeam(teamID, userID).subscribe();
    this.filterTeams()
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
    const user = this.usersList.find(u => u.userId === userID);
    return user ? user.username : 'Okänd användare';
  }

  subscribeToTeamUserUpdates() {
    this.joinUpdateSubscription = this.signalRService.userJoinTeamUpdates.subscribe(update => {
      if (update) {
        if (this.isUserInTeam(update.teamId, update.userId)) return;
        this.usersInTeam = this.usersInTeam.map(team =>
          team.teamID === update.teamId ? { ...team, userIDs: [...team.userIDs, Number(update.userId)] } : team
        );
        this.filterTeams()
        this.cdr.detectChanges();
      }
    });

    this.leaveUpdateSubscription = this.signalRService.userLeftTeamUpdates.subscribe(update => {
      if (update) {
        this.usersInTeam = this.usersInTeam.map(team =>
          team.teamID === update.teamId ? { ...team, userIDs: team.userIDs.filter(id => id !== Number(update.userId)) } : team
        );
        this.filterTeams()
        this.cdr.detectChanges();
      }
    });
  }

  filterTeams() {
    if (this.query) {
      this.filteredTeams = this.usersInTeam.filter(team =>
        this.getTeamName(team.teamID).toLowerCase().includes(this.query.toLowerCase())
      );
    } else {
      this.filteredTeams = [...this.usersInTeam];
    }
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
