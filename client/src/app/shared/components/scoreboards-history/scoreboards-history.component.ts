import { Component, inject, OnInit } from '@angular/core';
import { ScoreboardService } from '@app/core/services/scoreboardService/scoreboard.service';
import { NgFor, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { map } from 'rxjs/operators';
import { Scoreboards } from '@app/shared/models/scoreboards.model';

@Component({
  selector: 'app-scoreboards-history',
  standalone: true,
  imports: [NgFor, DatePipe, RouterLink],
  providers: [ScoreboardService],
  templateUrl: './scoreboards-history.component.html',
  styleUrls: ['./scoreboards-history.component.css']
})
export class ScoreboardsHistoryComponent implements OnInit {
  scoreboardService = inject(ScoreboardService);
  inactiveScoreboards: Scoreboards[] = [];

  ngOnInit(): void {
    this.loadScoreboards();
  }

  loadScoreboards(): void {
    this.scoreboardService.getAllScoreboards().pipe(
      map(scoreboards => scoreboards.filter(scoreboard => !scoreboard.active))
    ).subscribe(filteredScoreboards => {
      this.inactiveScoreboards = filteredScoreboards;
    });
  }
}
