import { Component, inject, OnInit } from '@angular/core';
import { ScoreboardService } from '@app/core/services/scoreboardService/scoreboard.service';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { RouterLink, Router, NavigationEnd} from '@angular/router';
import { map } from 'rxjs/operators';
import { Scoreboards } from '@app/shared/models/scoreboards.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-scoreboards-history',
  standalone: true,
  imports: [NgFor, NgIf, DatePipe, RouterLink, FormsModule],
  providers: [ScoreboardService],
  templateUrl: './scoreboards-history.component.html',
  styleUrls: ['./scoreboards-history.component.css']
})
export class ScoreboardsHistoryComponent implements OnInit {
  scoreboardService = inject(ScoreboardService);
  router = inject(Router);
  query: string = '';
  inactiveScoreboards: Scoreboards[] = [];
  filteredScoreboards: Scoreboards[] = [];

  ngOnInit(): void {
    this.loadScoreboards();
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        window.scrollTo(0, 0);
      }
    });
  }

  loadScoreboards(): void {
    this.scoreboardService.getAllScoreboards().pipe(
      map(scoreboards => scoreboards.filter(scoreboard => !scoreboard.active))
    ).subscribe(filteredScoreboards => {
      this.inactiveScoreboards = filteredScoreboards;
      this.filterScoreboards();
    });
  }
  filterScoreboards(): void {
    if (this.query) {
      this.filteredScoreboards = this.inactiveScoreboards.filter(scoreboard =>
        scoreboard.name.toLowerCase().includes(this.query.toLowerCase())
      );
    } else {
      this.filteredScoreboards = [...this.inactiveScoreboards];
    }
  }
}
