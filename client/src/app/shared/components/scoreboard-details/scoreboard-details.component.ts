import { Component, inject } from '@angular/core';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ScoreboardService } from '@app/core/services/ScoreboardService/scoreboard.service';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-scoreboard-details',
  standalone: true,
  imports: [NgIf, NgFor, AsyncPipe],
  templateUrl: './scoreboard-details.component.html',
  styleUrl: './scoreboard-details.component.css'
})
export class ScoreboardDetailsComponent {
  scoreboardService = inject(ScoreboardService);
  route = inject(ActivatedRoute);

  getRichScoreboard$ = this.route.paramMap.pipe(
    switchMap(params => {
      const id = params.get('id'); 
      return this.scoreboardService.getRichScoreboard(id!); 
    })
  );
}
