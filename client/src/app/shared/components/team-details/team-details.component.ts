import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TeamUsersService } from '@app/core/services/teamUsersService/team-users.service';
import { ScoreboardTeamsService } from '@app/core/services/scoreboardTeamsService/scoreboard-teams.service';
import { NgIf, NgFor, AsyncPipe, DatePipe } from '@angular/common';
import { BehaviorSubject, switchMap } from 'rxjs';
import { ScoreboardTeamsResponseOne } from '@app/shared/models/scoreboardTeamsOne.model'
import { TeamUsers } from '@app/shared/models/teamUser.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-team-details',
  imports: [NgIf, NgFor, AsyncPipe, DatePipe, RouterLink],
  templateUrl: './team-details.component.html',
  styleUrl: './team-details.component.css'
})
export class TeamDetailsComponent {

  teamUsersService = inject(TeamUsersService);
  scoreboardTeamsService = inject(ScoreboardTeamsService);
  // getOneTeamWithUsers$: Observable<any> | undefined;
  // getOneScoreboardTeam$: Observable<any> | undefined;
  
  scoreboardTeamsResonseSubject = new BehaviorSubject<ScoreboardTeamsResponseOne[] | null>(null);
  teamUsersResonseSubject = new BehaviorSubject<TeamUsers | null>(null);
  getOneScoreboardTeam$ = this.scoreboardTeamsResonseSubject.asObservable();
  getOneTeamWithUsers$ = this.teamUsersResonseSubject.asObservable();

  route = inject(ActivatedRoute);

  ngOnInit() {
    this.loadInitialScoreboardTeam();
    this.loadInitialTeamWithUsers();
  }

  loadInitialScoreboardTeam() {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('teamID');
        return this.scoreboardTeamsService.getOneScoreboardTeam(id!);
      })
    ).subscribe(scoreboardResponse => {
      this.scoreboardTeamsResonseSubject.next(scoreboardResponse);
    });
  }

  loadInitialTeamWithUsers() {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('teamID');
        return this.teamUsersService.getOneTeamWithUsers(id!);
      })
    ).subscribe(TeamUsersResponse => {
      this.teamUsersResonseSubject.next(TeamUsersResponse);
    });
  }

}
