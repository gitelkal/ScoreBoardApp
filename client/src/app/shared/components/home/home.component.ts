import { Component, inject } from '@angular/core';
import { ScoreboardService } from '@app/core/services/scoreboardService/scoreboard.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NgIf, NgFor, AsyncPipe, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [MatButtonModule, MatIconModule, MatCardModule, MatToolbarModule, NgIf, NgFor, AsyncPipe, RouterLink, DatePipe],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
    scoreboardService = inject(ScoreboardService);
    getAllScoreboards$ = this.scoreboardService.getAllScoreboards();
}
