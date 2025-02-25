import { Component, inject, OnInit } from '@angular/core';
import { ScoreboardService } from '@app/core/services/scoreboardService/scoreboard.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NgIf, NgFor, AsyncPipe, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { SignalRService } from '@app/core/services/signalRService/signal-r.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [MatButtonModule, MatIconModule, MatCardModule, MatToolbarModule, NgIf, NgFor, AsyncPipe, RouterLink, DatePipe],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  scores: { teamId: number; points: number }[] = [];
    scoreboardService = inject(ScoreboardService);
    getAllScoreboards$ = this.scoreboardService.getAllScoreboards();

    constructor(private signalRService: SignalRService) { }

    ngOnInit() {
        this.signalRService.startConnection();

        this.signalRService.scoreUpdates.subscribe(update => {
            if (update) {
                const existingTeam = this.scores.findIndex(s => s.teamId === update.teamId);
                if (existingTeam === -1) {
                    this.scores.push(update);
                } else {
                    this.scores[existingTeam] = update;
                }
            }
        });
    }
}
