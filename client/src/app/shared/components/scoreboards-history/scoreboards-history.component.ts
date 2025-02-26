import { Component, inject } from '@angular/core';
import { ScoreboardService } from '@app/core/services/scoreboardService/scoreboard.service';
import { NgIf, NgFor, AsyncPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-scoreboards-history',
  standalone: true,
  imports: [NgIf, NgFor, AsyncPipe, DatePipe, RouterLink],
  providers: [ScoreboardService],
  templateUrl: './scoreboards-history.component.html',
  styleUrl: './scoreboards-history.component.css'
})

export class ScoreboardsHistoryComponent {
  scoreboardService = inject(ScoreboardService);
  
  getAllScoreboards$ = this.scoreboardService.getAllScoreboards();
}