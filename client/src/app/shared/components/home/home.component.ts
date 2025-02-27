import { Component, inject, OnInit } from '@angular/core';
import { ScoreboardService } from '@app/core/services/scoreboardService/scoreboard.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NgIf, NgFor, AsyncPipe, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { SignalRService } from '@app/core/services/signalRService/signal-r.service';

@Component({
  selector: 'app-home',
  imports: [MatButtonModule, MatIconModule, MatCardModule, MatToolbarModule, NgIf, NgFor, AsyncPipe, RouterLink, DatePipe],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

    constructor(private signalRService: SignalRService) { }

    scoreboardService = inject(ScoreboardService);
    getAllScoreboards$ = this.scoreboardService.getAllScoreboards();

    ngOnInit() {
        this.signalRService.startConnection();
        this.subscribeToScoreboardCreation();
    }

    subscribeToScoreboardCreation() {
        this.signalRService.scoreboardCreation.subscribe(scoreboardId => {
            if (scoreboardId) {
                this.getAllScoreboards$ = this.scoreboardService.getAllScoreboards();
            }
        });
    }
}
