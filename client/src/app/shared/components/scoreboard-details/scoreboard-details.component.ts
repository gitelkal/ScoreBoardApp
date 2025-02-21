import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ScoreboardService } from '@app/core/services/scoreboardService/scoreboard.service';
import { SignalRService } from '@app/core/services/signalRService/signal-r.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { AsyncPipe, NgIf, NgFor } from '@angular/common';
import { CommonModule } from '@angular/common';
import { switchMap, map } from 'rxjs/operators';
import { RichScoreboard } from '@app/shared/models/richScoreboard.model';

@Component({
  selector: 'app-scoreboard-details',
  standalone: true,
  imports: [NgIf, AsyncPipe, CommonModule],
  templateUrl: './scoreboard-details.component.html',
  styleUrls: ['./scoreboard-details.component.css']
})
export class ScoreboardDetailsComponent implements OnInit {
  scoreboardService = inject(ScoreboardService);
  route = inject(ActivatedRoute);
  openTeamIndex: number | null = null; // Track which team card is open
  constructor(private signalRService: SignalRService) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id'); 
      return this.scoreboardService.getRichScoreboard(id!); 
    });
  }
  getRichScoreboard$ = this.route.paramMap.pipe(
    switchMap(params => {
      const id = params.get('id'); 
      return this.scoreboardService.getRichScoreboard(id!); 
    })
  );
  
  

  toggleDropdown(index: number): void {
    this.openTeamIndex = this.openTeamIndex === index ? null : index;
  }
}
 