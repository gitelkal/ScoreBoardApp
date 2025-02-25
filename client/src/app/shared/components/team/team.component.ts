import { Component, inject } from '@angular/core';
import { TeamService } from '@app/core/services/teamService/team.service';
import { ScoreboardService } from '@app/core/services/scoreboardService/scoreboard.service';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-team',
  standalone: true,
  imports: [NgIf, NgFor, AsyncPipe],
  templateUrl: './team.component.html',
  styleUrl: './team.component.css'
})
export class TeamComponent {

  teamService = inject(TeamService);
  getAllTeams$ = this.teamService.getAllTeams();
  getOneTeam$ = this.teamService.getOneTeam('some-id');

  scoreboardService = inject(ScoreboardService);
  
  route = inject(ActivatedRoute);

}

