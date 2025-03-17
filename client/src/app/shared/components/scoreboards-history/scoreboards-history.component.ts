import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ScoreboardService } from '@app/core/services/scoreboardService/scoreboard.service';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { RouterLink, Router, NavigationEnd} from '@angular/router';
import { map, takeUntil } from 'rxjs/operators';
import { Scoreboards } from '@app/shared/models/scoreboards.model';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-scoreboards-history',
  standalone: true,
  imports: [NgFor, NgIf, DatePipe, RouterLink, FormsModule],
  providers: [ScoreboardService],
  templateUrl: './scoreboards-history.component.html',
  styleUrls: ['./scoreboards-history.component.css']
})
export class ScoreboardsHistoryComponent implements OnInit, OnDestroy {
  scoreboardService = inject(ScoreboardService);
  router = inject(Router);
  query: string = '';
  inactiveScoreboards: Scoreboards[] = [];
  filteredScoreboards: Scoreboards[] = [];

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.loadScoreboards();
    this.router.events.pipe(
      takeUntil(this.destroy$)
    ).subscribe(event => {
      if (event instanceof NavigationEnd) {
        window.scrollTo(0, 0);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async loadScoreboards(): Promise<void> {
    try {
      const scoreboards = await this.scoreboardService.getAllScoreboards();
      this.inactiveScoreboards = scoreboards.filter(scoreboard => !scoreboard.active);
      this.filterScoreboards();
    } catch (error) {
      console.error('Error loading scoreboards:', error);
    }
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
