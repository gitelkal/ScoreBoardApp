import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ScoreboardService } from '@app/core/services/scoreboardService/scoreboard.service';
import { SignalRService } from '@app/core/services/signalRService/signal-r.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { Scoreboards } from '@app/shared/models/scoreboards.model';
import { ScoreboardTeams } from '@app/shared/models/scoreboardTeams.model';
import { AsyncPipe, NgIf, NgFor } from '@angular/common';
import { CommonModule } from '@angular/common';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-scoreboard-details',
  standalone: true,
  imports: [NgIf, AsyncPipe, CommonModule],
  templateUrl: './scoreboard-details.component.html',
  styleUrls: ['./scoreboard-details.component.css']
})
export class ScoreboardDetailsComponent implements OnInit {
  scoreboard$!: Observable<Scoreboards>;
  teams$ = new BehaviorSubject<ScoreboardTeams[]>([]); // Store teams as an observable

  scoreboardService = inject(ScoreboardService);
  route = inject(ActivatedRoute);

  constructor(private signalRService: SignalRService) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.scoreboard$ = this.scoreboardService.getOneScoreboard(id);
      }
    });
  }

  getRichScoreboard$ = this.route.paramMap.pipe(
    switchMap(params => {
      const id = params.get('id'); 
      return this.scoreboardService.getRichScoreboard(id!); 
    })
  );
}
