import { Component, inject, OnInit } from '@angular/core';
import { ScoreboardService } from '@app/core/services/ScoreboardService/scoreboard.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NgFor, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { SignalRService } from '@app/core/services/signalRService/signal-r.service';
import { Scoreboards } from '@app/shared/models/scoreboards.model';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  imports: [MatButtonModule, MatIconModule, MatCardModule, MatToolbarModule, NgFor, RouterLink, DatePipe],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
    scoreboardService = inject(ScoreboardService);
    getAllScoreboards$ = this.scoreboardService.getAllScoreboards();
    activeScoreboards: Scoreboards[] = [];

    constructor(private signalRService: SignalRService) { }

    ngOnInit() {
        this.signalRService.startConnection();
        this.subscribeToScoreboardCreation();
        this.loadScoreboards();
    }

    loadScoreboards(): void {
        this.scoreboardService.getAllScoreboards().pipe(
        map(scoreboards => scoreboards.filter(scoreboard => scoreboard.active))
        ).subscribe(filteredScoreboards => {
        this.activeScoreboards = filteredScoreboards;
        });
    }

    subscribeToScoreboardCreation() {
        this.signalRService.scoreboardCreation.subscribe(scoreboardId => {
            if (scoreboardId) {
                this.getAllScoreboards$ = this.scoreboardService.getAllScoreboards();
            }
        });
    }
}
