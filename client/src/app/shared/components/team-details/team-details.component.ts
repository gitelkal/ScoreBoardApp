import { Component, inject, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink, Router, NavigationEnd } from '@angular/router';
import { TeamUsersService } from '@app/core/services/teamUsersService/team-users.service';
import { ScoreboardTeamsService } from '@app/core/services/scoreboardTeamsService/scoreboard-teams.service';
import { NgIf, NgFor, DatePipe, AsyncPipe } from '@angular/common';
import { AuthService } from '@app/core/services/auth/auth.service';
import { SignalRService } from '@app/core/services/signalRService/signal-r.service';
import { Subscription, from } from 'rxjs';
import { ScoreboardTeamsResponseOne } from '@app/shared/models/scoreboardTeamsOne.model';
import { Users } from '@app/shared/models/users.model';
import { UserService } from '@app/core/services/userService/user.service';
import { Teams } from '@app/shared/models/teams.models';

@Component({
  selector: 'app-team-details',
  imports: [NgIf, NgFor, DatePipe, RouterLink, AsyncPipe],
  templateUrl: './team-details.component.html',
  styleUrl: './team-details.component.css'
})
export class TeamDetailsComponent implements OnInit, OnDestroy {
  scoreboardTeamsService = inject(ScoreboardTeamsService);
  teamUsersService = inject(TeamUsersService);
  signalRService = inject(SignalRService);
  userService = inject(UserService);
  cdr = inject(ChangeDetectorRef);
  route = inject(ActivatedRoute);
  auth = inject(AuthService);
  router = inject(Router);

  teamName: string = '';
  teamID: number = 0;
  userID = this.auth.getUserID() ?? 0;
  loggedIn = this.auth.loggedIn;
  isInTeam: boolean = false;
  usersList: Users[] = [];
  usersInTeam: Teams[] = [];
  scoreboardsList: ScoreboardTeamsResponseOne[] = [];
  
  private userSubscription: Subscription | undefined;
  private teamSubscription: Subscription | undefined;
  private scoreboardSubscription: Subscription | undefined;;

  constructor() {
    this.route.paramMap.subscribe(params => {
      const teamID = params.get('teamID');
      this.teamID = Number(teamID);
      this.loadTeamDetails();
    });
  }

  ngOnInit() {
    this.signalRService.startConnection();
    this.subscribeToTeamUserUpdates();
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        window.scrollTo(0, 0);
      }
    });
  }

  ngOnDestroy() {
    this.userSubscription?.unsubscribe();
    this.teamSubscription?.unsubscribe();
    this.scoreboardSubscription?.unsubscribe();
  }

  loadTeamDetails() {
    this.teamSubscription = from(this.teamUsersService.getOneTeamWithUsers(this.teamID)).subscribe((response) => {
        this.teamName = response.team.teamName;
        this.usersList = response.users.map(user => ({
          userId: user.userId,
          username: user.username,
          firstname: user.firstname,
          lastname: user.lastname
        }));
        this.isInTeam = this.isUserInTeam(this.userID);
      });

    from(this.scoreboardTeamsService.getOneScoreboardTeam(this.teamID)).subscribe((response) => {
      this.scoreboardsList = response.map(scoreboard => ({
        scoreboardId: scoreboard.scoreboardId,
        name: scoreboard.name,
        description: scoreboard.description,
        startedAt: scoreboard.startedAt,
        endedAt: scoreboard.endedAt,
        active: scoreboard.active,
        points: scoreboard.points
      }));
    });
    this.userService.getUserTeams(this.userID).then((teams) => {
      this.usersInTeam = teams;
    });
  }

  joinTeam(userID: number, teamID: number): void {
    if (this.isUserInTeam(userID)) return;
    this.teamUsersService.joinTeam(userID, teamID).subscribe();
    this.isInTeam = true;
  }

  dropFromTeam(userID: number, teamID: number): void {
    this.teamUsersService.removeUserFromTeam(teamID, userID).subscribe();
  }

  isUserInTeam(userID: number): boolean {
    return this.usersList.some(user => user.userId === userID);
  }

  subscribeToTeamUserUpdates() {
    this.userSubscription = this.signalRService.userJoinTeamUpdates.subscribe(update => {
      if (update && !this.isUserInTeam(update.userId)) {
        this.usersList.push({
          userId: update.userId,
          username: this.auth.getUsername() ?? '',
          firstname: this.auth.getFirstname() ?? '',
          lastname: this.auth.getLastname() ?? ''
        });
        this.cdr.detectChanges();
      }
    });
    this.signalRService.userLeftTeamUpdates.subscribe(update => {
      if (update) {
        this.usersList = this.usersList.filter(user => user.userId !== update.userId);
        this.isInTeam = this.isUserInTeam(this.userID);
        this.cdr.detectChanges();
      }
    });
  }
  
}
