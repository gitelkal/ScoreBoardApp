import { Component } from '@angular/core';
import { ScoreboardBaseComponent } from '../scoreboard-base/scoreboard-base.component';
import { CommonModule, AsyncPipe, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterModule, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-scoreboard-task-view',
  standalone: true,
  imports: [CommonModule, AsyncPipe, NgIf, NgFor, FormsModule, MatDialogModule, RouterModule, RouterLink],
  templateUrl: './scoreboard-task-view.component.html',
  styleUrls: ['./scoreboard-task-view.component.css']
})

export class ScoreboardTaskViewComponent extends ScoreboardBaseComponent {
  isViewDropdownOpen = false; 
  isEditingTaskCount = false;
  isEditingTaskPoints = false;

  override destroy$ = new Subject<void>();

  override ngOnInit() {
    super.ngOnInit();
    this.subscribeToTaskUpdates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  
  private subscribeToTaskUpdates() {
    this.signalRService.taskCountUpdates.pipe(
      takeUntil(this.destroy$)
    ).subscribe(data => {
      if (data) {
        this.taskCountMap.set(Number(this.scoreboardID), data.taskCount);
      }
    });

    this.signalRService.taskPointsUpdates.pipe(
      takeUntil(this.destroy$)
    ).subscribe(data => {
      if (data) {
        this.pointsPerTaskMap.set(Number(this.scoreboardID), data.pointsPerTask);
      }
    });

    this.signalRService.taskCompletionUpdates.pipe(
      takeUntil(this.destroy$)
    ).subscribe(data => {
      if (data) {
        this.updateTeamProgress(data.scoreboardId, data.teamId, data.points);
      }
    });
  }

  onTaskCountChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const newValue = Number(inputElement.value);

    if (!this.scoreboardID || isNaN(newValue)) return;

    const scoreboardId = Number(this.scoreboardID);
    this.taskCountMap.set(scoreboardId, newValue);
  }

  onPointsPerTaskChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const newValue = Number(inputElement.value);

    if (!this.scoreboardID || isNaN(newValue)) return;

    const scoreboardId = Number(this.scoreboardID);
    this.pointsPerTaskMap.set(scoreboardId, newValue);
  }

  toggleViewDropdown() {
    this.isViewDropdownOpen = !this.isViewDropdownOpen;
  }
  
  get taskCount(): number {
    return this.taskCountMap.get(Number(this.scoreboardID)) || 1;
  }

  get pointsPerTask(): number {
    return this.pointsPerTaskMap.get(Number(this.scoreboardID)) || 100;
  }

  startEditTaskCount() {
    this.isEditingTaskCount = true;
  }

  saveTaskCount() {
    this.isEditingTaskCount = false;
    if (!this.scoreboardID) return;
    this.taskCountMap.set(Number(this.scoreboardID), this.taskCount);
    console.log(`Antal tasks sparat lokalt:`, this.taskCountMap);
  }
  
  startEditTaskPoints() {
    this.isEditingTaskPoints = true;
  }

  saveTaskPoints() {
    this.isEditingTaskPoints = false;
    if (!this.scoreboardID) return;
    this.pointsPerTaskMap.set(Number(this.scoreboardID), this.pointsPerTask);
    console.log(`Poäng per task sparat lokalt:`, this.pointsPerTaskMap);
  }
  

  completeTask(teamId: number) {
    if (!this.scoreboardID) return;
  
    const scoreboardId = Number(this.scoreboardID);

    if (!this.completedTasksMap.has(scoreboardId)) {
      this.completedTasksMap.set(scoreboardId, new Map());
    }
  
    const teamTasks = this.completedTasksMap.get(scoreboardId)!;
    teamTasks.set(teamId, (teamTasks.get(teamId) || 0) + 1);
    const teamPoints = this.pointsPerTask;
    const currentPoints = this.scoreboardResponseSubject.value?.scoreboard?.teams.find(team => team.teamID === teamId)?.points || 0;
    const updatedPoints = currentPoints + teamPoints;
  
    this.setPoints(teamId, updatedPoints);
  }

  getCompletedTasks(teamId: number): number {
    if (!this.scoreboardID) return 0;
    const scoreboardId = Number(this.scoreboardID);
    return this.completedTasksMap.get(scoreboardId)?.get(teamId) || 0;
}

  protected override updateTeamProgress(scoreboardId: number, teamId: number, points: number): void {
    const currentScoreboard = this.scoreboardResponseSubject.value;
    if (!currentScoreboard?.scoreboard?.teams) return;

    const teamToUpdate = currentScoreboard.scoreboard.teams.find(team => team.teamID === teamId);
    if (teamToUpdate) {
      teamToUpdate.points = points;
      currentScoreboard.scoreboard.teams.sort((a, b) => b.points - a.points);
      this.scoreboardResponseSubject.next(currentScoreboard);
    }
  }
  
  getTaskColor(taskIndex: number): string {
    const colors = ['#FF0000', '#FF8000', '#FFFF00', '#80FF00', '#00FF00', '#00FF80', '#00FFFF', '#0080FF', '#0000FF', '#8000FF'];
    return colors[taskIndex % colors.length];
  }
  
}