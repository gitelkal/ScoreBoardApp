import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ScoreboardService } from '@app/core/services/scoreboardService/scoreboard.service';
import { SignalRService } from '@app/core/services/signalRService/signal-r.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { AsyncPipe, NgIf, NgFor } from '@angular/common';
import { CommonModule } from '@angular/common';
import { switchMap } from 'rxjs/operators';
import { ScoreboardResponse } from '@app/shared/models/richScoreboard.model';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-scoreboard-details',
  standalone: true,
  imports: [NgIf, AsyncPipe, CommonModule, FormsModule],
  templateUrl: './scoreboard-details.component.html',
  styleUrls: ['./scoreboard-details.component.css']
})
export class ScoreboardDetailsComponent implements OnInit {
  isAddingTeam = false;
  newTeamName = '';
  scoreboardService = inject(ScoreboardService);
  route = inject(ActivatedRoute);
  openTeamIndex: number | null = null;

  private scoreboardResonseSubject = new BehaviorSubject<ScoreboardResponse | null>(null);
  getRichScoreboard$ = this.scoreboardResonseSubject.asObservable();

  constructor(private signalRService: SignalRService,private http: HttpClient) {}

  ngOnInit() {
    this.signalRService.startConnection();
    this.subscribeToScoreUpdates();
    this.loadInitialScoreboard();
  }

  loadInitialScoreboard() {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        return this.scoreboardService.getRichScoreboard(id!);
      })
    ).subscribe(ScoreboardResponse => {
      this.scoreboardResonseSubject.next(ScoreboardResponse); 
    });
  }

  subscribeToScoreUpdates() {
    this.signalRService.scoreUpdates.subscribe(update => {
      if (update) {
        const currentScoreboard = this.scoreboardResonseSubject.value;
  
        if (currentScoreboard?.scoreboard?.teams) {  
          const updatedTeams = currentScoreboard.scoreboard.teams.map(team => 
            team.teamID === update.teamId ? { ...team, points: update.points } : team
          );

          const sortedTeams = updatedTeams.sort((a, b) => b.points - a.points);
  
          this.scoreboardResonseSubject.next({
            ...currentScoreboard,
            scoreboard: {
              ...currentScoreboard.scoreboard,
              teams: sortedTeams
            }
          });
        }
      }
    });
  } 

  addTeam(event: Event) {
    event.preventDefault();
    
    if (!this.newTeamName.trim()) return;

    const newTeam = { teamName: this.newTeamName };

    this.http.post('/api/teams', newTeam).subscribe({
      next: (response) => {
        console.log('Team added:', response);
        this.isAddingTeam = false;
        this.newTeamName = '';
      },
      error: (error) => {
        console.error('Error adding team:', error);
      }
    });
  }

  toggleDropdown(index: number): void {
    this.openTeamIndex = this.openTeamIndex === index ? null : index;
  }
}
