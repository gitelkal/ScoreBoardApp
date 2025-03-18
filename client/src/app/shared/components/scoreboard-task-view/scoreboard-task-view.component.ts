import { Component } from '@angular/core';
import { ScoreboardBaseComponent } from '../scoreboard-base/scoreboard-base.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-scoreboard-task-view',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './scoreboard-task-view.component.html',
  styleUrls: ['./scoreboard-task-view.component.css']
})

export class ScoreboardTaskViewComponent extends ScoreboardBaseComponent {
  isViewDropdownOpen = false; 

  protected taskCountMap = new Map<number, number>(); 
  protected pointsPerTaskMap = new Map<number, number>();
  protected completedTasksMap = new Map<number, Map<number, number>>();


  override destroy$ = new Subject<void>();

  override ngOnInit() {
    super.ngOnInit();
    this.subscribeToTaskUpdates();
    if (this.scoreboardID) {
      this.loadScoreboardData(Number(this.scoreboardID));
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private subscribeToTaskUpdates() {
    this.signalRService.taskCountUpdates.pipe(takeUntil(this.destroy$))
    .subscribe(data => data && this.taskCountMap.set(Number(this.scoreboardID), data.taskCount));

    this.signalRService.taskPointsUpdates.pipe(takeUntil(this.destroy$))
    .subscribe(data => data && this.pointsPerTaskMap.set(Number(this.scoreboardID), data.pointsPerTask));

    this.signalRService.taskCompletionUpdates.pipe(takeUntil(this.destroy$))
    .subscribe(data => data && this.updateTeamProgress(data.teamId, data.points));
  }

  toggleViewDropdown() {
    this.isViewDropdownOpen = !this.isViewDropdownOpen;
  }

  private loadScoreboardData(scoreboardId: number) {
    this.scoreboardService.getNumberOfTasks(scoreboardId).subscribe(taskCount => {
      this.taskCountMap.set(scoreboardId, taskCount);
    });
    this.scoreboardService.getRichScoreboard(scoreboardId.toString()).then(response => {
      this.scoreboardResponseSubject.next(response);
      response.scoreboard.teams.forEach(team => {
        this.scoreboardTeamsService.getTasksForTeam(scoreboardId, team.teamID).subscribe(tasksResponse => {
          if (tasksResponse?.tasksCompleted !== undefined) {
            if (!this.completedTasksMap.has(scoreboardId)) {
              this.completedTasksMap.set(scoreboardId, new Map());
            }
            this.completedTasksMap.get(scoreboardId)!.set(team.teamID, tasksResponse.tasksCompleted);
          }
        });
      });
    });
  }
  
  onTaskCountChange(event: Event) {
    const newValue = Number((event.target as HTMLInputElement).value);
    if (this.scoreboardID && !isNaN(newValue)) {
      const scoreboardId = Number(this.scoreboardID);
      this.scoreboardService.updateNumberOfTasks(scoreboardId, newValue).subscribe(() => {
        this.scoreboardService.getNumberOfTasks(scoreboardId).subscribe(updatedValue => {
          this.taskCountMap.set(scoreboardId, updatedValue);
        });
      });
    }
  }

  completeTask(teamId: number) {
    if (!this.scoreboardID) return;
    const scoreboardId = Number(this.scoreboardID);
    const newCompletedTasks = (this.completedTasksMap.get(scoreboardId)?.get(teamId) || 0) + 1;
    const newPoints = newCompletedTasks * (this.pointsPerTaskMap.get(scoreboardId) || 100);
    this.scoreboardTeamsService.updateTasksForTeam(scoreboardId, teamId, newCompletedTasks).subscribe(() => {
      if (!this.completedTasksMap.has(scoreboardId)) {
          this.completedTasksMap.set(scoreboardId, new Map());
      }
      this.completedTasksMap.get(scoreboardId)!.set(teamId, newCompletedTasks);
      this.setPoints(teamId, newPoints);
    });
  }

  onPointsPerTaskChange(event: Event) {
    const newValue = Number((event.target as HTMLInputElement).value);
    if (this.scoreboardID && !isNaN(newValue)) {
      this.pointsPerTaskMap.set(Number(this.scoreboardID), newValue);
    }
  }

  undoTask(teamId: number) {
    if (!this.scoreboardID) return;
    const scoreboardId = Number(this.scoreboardID);
    const currentCompletedTasks = this.completedTasksMap.get(scoreboardId)?.get(teamId) || 0;
    if (currentCompletedTasks > 0) {
      const newCompletedTasks = currentCompletedTasks - 1;
      const newPoints = newCompletedTasks * (this.pointsPerTaskMap.get(scoreboardId) || 100);
      this.scoreboardTeamsService.updateTasksForTeam(scoreboardId, teamId, newCompletedTasks).subscribe(() => {
        this.completedTasksMap.get(scoreboardId)!.set(teamId, newCompletedTasks);
        this.setPoints(teamId, newPoints);
      });
    }
  }

  getCompletedTasks(teamId: number): number {
    return this.scoreboardID ? (this.completedTasksMap.get(Number(this.scoreboardID))?.get(teamId) || 0) : 0;
  }

  override setPoints(teamId: number, points: number) {
    if (!this.scoreboardID) return;
    this.scoreboardTeamsService.setScoreboardTeamPoints(this.scoreboardID, teamId, points)
      .subscribe();
  }

  protected updateTeamProgress(teamId: number, points: number): void {
    const currentScoreboard = this.scoreboardResponseSubject.value;
    if (!currentScoreboard?.scoreboard?.teams) return;
    const teamToUpdate = currentScoreboard.scoreboard.teams.find(team => team.teamID === teamId);
    if (teamToUpdate) {
      teamToUpdate.points = (teamToUpdate.points || 0) + points;
      currentScoreboard.scoreboard.teams.sort((a, b) => b.points - a.points);
      this.scoreboardResponseSubject.next(currentScoreboard);
    }
  }

  getTaskColor(taskIndex: number): string {
    const colors = ['#FF0000', '#FF8000', '#FFFF00', '#80FF00', '#00FF00', '#00FF80', '#00FFFF', '#0080FF', '#0000FF', '#8000FF'];
    return colors[taskIndex % colors.length];
  }

  get taskArray(): any[] {
    return Array.from({ length: this.taskCount });
  }

  getCompletedTasksArray(teamId: number): any[] {
    return Array.from({ length: this.getCompletedTasks(teamId) });
  }  

  get taskCount(): number {
    return this.taskCountMap.get(Number(this.scoreboardID)) || 1;
  }

  get pointsPerTask(): number {
    return this.pointsPerTaskMap.get(Number(this.scoreboardID)) || 100;
  }
}