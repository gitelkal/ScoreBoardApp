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
import { RegisterComponent } from '../register/register.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-scoreboard-details',
  standalone: true,
  imports: [NgIf, AsyncPipe, CommonModule, FormsModule],
  templateUrl: './scoreboard-details.component.html',
  styleUrls: ['./scoreboard-details.component.css']
})
export class ScoreboardDetailsComponent implements OnInit {
  readonly dialog = inject(MatDialog);
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
  
    this.route.paramMap.pipe(
      switchMap(params => {
        const scoreboardId = params.get('id'); // Get the scoreboard ID from the route
        if (!scoreboardId) {
          console.error("Scoreboard ID is missing");
          return [];
        }
        
        return this.scoreboardService.CreateAndAddEmptyTeamToScoreboard(scoreboardId, this.newTeamName);
      })
    ).subscribe({
      next: (response) => {
        console.log('Team added:', response);
        this.isAddingTeam = false;
        this.newTeamName = '';
        this.loadInitialScoreboard(); // Reload scoreboard to reflect the new team
      },
      error: (error) => {
        console.error('Error adding team:', error);
      }
    });
  }
  
  toggleRegisterModal() {
      this.dialog.open(RegisterComponent);
    }

  toggleDropdown(index: number): void {
    this.openTeamIndex = this.openTeamIndex === index ? null : index;
  }
}
