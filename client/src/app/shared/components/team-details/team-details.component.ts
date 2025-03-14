import { Component, inject, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink, Router, NavigationEnd } from '@angular/router';
import { TeamUsersService } from '@app/core/services/teamUsersService/team-users.service';
import { ScoreboardTeamsService } from '@app/core/services/scoreboardTeamsService/scoreboard-teams.service';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { AuthService } from '@app/core/services/auth/auth.service';
import { SignalRService } from '@app/core/services/signalRService/signal-r.service';
import { Subscription } from 'rxjs';
import { ScoreboardTeamsResponseOne } from '@app/shared/models/scoreboardTeamsOne.model';
import { Users } from '@app/shared/models/users.model';
import { UserTeamsList } from '@app/shared/models/userTeamList.model';

@Component({
  selector: 'app-team-details',
  imports: [NgIf, NgFor, DatePipe, RouterLink],
  templateUrl: './team-details.component.html',
  styleUrl: './team-details.component.css'
})
export class TeamDetailsComponent implements OnInit, OnDestroy {
  cdr = inject(ChangeDetectorRef);
  teamUsersService = inject(TeamUsersService);
  scoreboardTeamsService = inject(ScoreboardTeamsService);
  signalRService = inject(SignalRService);
  route = inject(ActivatedRoute);
  auth = inject(AuthService);
  router = inject(Router);

  teamName: string = '';
  teamID: number = 0;
  userID = this.auth.getUserID() ?? 0;
  isInTeam: boolean = false;
  usersList: Users[] = [];
  usersInTeam: UserTeamsList[] = [];
  scoreboardsList: ScoreboardTeamsResponseOne[] = [];
  
  private userSubscription: Subscription | undefined;
  private teamSubscription: Subscription | undefined;
  private scoreboardSubscription: Subscription | undefined;

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
    this.teamSubscription = this.teamUsersService.getOneTeamWithUsers(this.teamID).subscribe({
      next: (response) => {
        this.teamName = response.team.teamName;
        this.usersList = response.users.map(user => ({
          userId: user.userId,
          username: user.username,
          firstname: user.firstname,
          lastname: user.lastname
        }));
        this.isInTeam = this.isUserInTeam(this.userID);
      }
    });

    this.scoreboardSubscription = this.scoreboardTeamsService.getOneScoreboardTeam(this.teamID).subscribe({
      next: (response) => {
        this.scoreboardsList = response.map(scoreboard => ({
          scoreboardId: scoreboard.scoreboardId,
          name: scoreboard.name,
          description: scoreboard.description,
          startedAt: scoreboard.startedAt,
          endedAt: scoreboard.endedAt,
          active: scoreboard.active,
          points: scoreboard.points
        }));
      }
    });
  }

  joinTeam(userID: number, teamID: number): void {
    if (this.isUserInTeam(userID)) return;
    this.teamUsersService.joinTeam(userID, teamID).subscribe();
    this.isInTeam = true;
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
  }
}
