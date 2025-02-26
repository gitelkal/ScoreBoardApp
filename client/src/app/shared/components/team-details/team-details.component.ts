import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TeamService } from '@app/core/services/teamService/team.service';
import { ScoreboardResponse } from '@app/shared/models/richScoreboard.model';
import { switchMap, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';
import { response } from 'express';
import { userInfo } from 'os';

@Component({
  selector: 'app-team-details',
  imports: [NgIf, NgFor, AsyncPipe],
  templateUrl: './team-details.component.html',
  styleUrl: './team-details.component.css'
})
export class TeamDetailsComponent {

  teamService = inject(TeamService);
  route = inject(ActivatedRoute);

  team$: Observable<any>;

  constructor() {
    this.team$ = this.route.paramMap.pipe(
      switchMap(params => 
        this.teamService.getTeamWithUsers().pipe(
          map((teams: any[]) => {
            const teamID = Number(params.get('teamID'));
            const team = teams.find(t => t.team.teamID === teamID);
            return team ? { 
              teamName: team.team.teamName,
              users: team.users.map((user: any) => user.userName)
            } : null;
        })
      )
    )
    );
  }
}
