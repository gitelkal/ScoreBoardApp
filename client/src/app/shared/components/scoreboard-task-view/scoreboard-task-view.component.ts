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

    if (!this.scoreboardID) return;
    const scoreboardId = Number(this.scoreboardID);
    this.scoreboardService.getNumberOfTasks(scoreboardId).subscribe(taskCount => {
      this.taskCountMap.set(scoreboardId, taskCount);
    });
    this.scoreboardService.getRichScoreboard(this.scoreboardID).then(response => {
      this.scoreboardResponseSubject.next(response);
      response.scoreboard.teams.forEach(team => {
        this.scoreboardTeamsService.getTasksForTeam(scoreboardId, team.teamID).subscribe(tasksResponse => {
          if (!tasksResponse || tasksResponse.tasksCompleted === undefined) {
            return;
          }
          if (!this.completedTasksMap.has(scoreboardId)) {
            this.completedTasksMap.set(scoreboardId, new Map());
          }
          this.completedTasksMap.get(scoreboardId)!.set(team.teamID, tasksResponse.tasksCompleted);
        });
      });
    });
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
    this.scoreboardService.updateNumberOfTasks(scoreboardId, newValue).subscribe(() => {
      this.scoreboardService.getNumberOfTasks(scoreboardId).subscribe(updatedValue => {
          this.taskCountMap.set(scoreboardId, updatedValue);
      });
    });
  }

  completeTask(teamId: number) {
    if (!this.scoreboardID) return;
    const scoreboardId = Number(this.scoreboardID);
    const currentCompletedTasks = this.completedTasksMap.get(scoreboardId)?.get(teamId) || 0;
    const newCompletedTasks = isNaN(currentCompletedTasks) ? 1 : Number(currentCompletedTasks) + 1;
    const pointsPerTask = this.pointsPerTaskMap.get(scoreboardId) || 100;
    const newPoints = newCompletedTasks * pointsPerTask; 
    const dto = { tasksCompleted: newCompletedTasks, points: newPoints  };

    this.scoreboardTeamsService.updateTasksForTeam(scoreboardId, teamId, newCompletedTasks).subscribe(() => {
      if (!this.completedTasksMap.has(scoreboardId)) {
          this.completedTasksMap.set(scoreboardId, new Map());
      }
      this.completedTasksMap.get(scoreboardId)!.set(teamId, newCompletedTasks);
      this.setPoints(teamId, newPoints);
    });
  }

  onPointsPerTaskChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const newValue = Number(inputElement.value);
    if (!this.scoreboardID || isNaN(newValue)) return;
    const scoreboardId = Number(this.scoreboardID);
    this.pointsPerTaskMap.set(scoreboardId, newValue);
  }

  undoTask(teamId: number) {
    if (!this.scoreboardID) return;
    const scoreboardId = Number(this.scoreboardID);
    const currentCompletedTasks = this.completedTasksMap.get(scoreboardId)?.get(teamId) || 0;
    if (currentCompletedTasks <= 0) {
      return;
    }
    const newCompletedTasks = currentCompletedTasks - 1;
    const pointsPerTask = this.pointsPerTaskMap.get(scoreboardId) || 100;
    const newPoints = newCompletedTasks * pointsPerTask;
    const dto = { tasksCompleted: newCompletedTasks, points: newPoints };
    this.scoreboardTeamsService.updateTasksForTeam(scoreboardId, teamId, newCompletedTasks).subscribe(() => {
      if (!this.completedTasksMap.has(scoreboardId)) {
        this.completedTasksMap.set(scoreboardId, new Map());
      }
      this.completedTasksMap.get(scoreboardId)!.set(teamId, newCompletedTasks);
      this.setPoints(teamId, newPoints);
    });
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
  }
  
  startEditTaskPoints() {
    this.isEditingTaskPoints = true;
  }

  saveTaskPoints() {
    this.isEditingTaskPoints = false;
    if (!this.scoreboardID) return;
    this.pointsPerTaskMap.set(Number(this.scoreboardID), this.pointsPerTask);
  }
  






  getCompletedTasks(teamId: number): number {
    if (!this.scoreboardID) return 0;
    const scoreboardId = Number(this.scoreboardID);

    // 🛠 Försök att hämta från completedTasksMap först
    const completedTasks = this.completedTasksMap.get(scoreboardId)?.get(teamId);
    if (completedTasks !== undefined) return completedTasks;

    // 🛠 Om det inte finns, försök hämta från RichTeam
    const team = this.scoreboardResponseSubject.value?.scoreboard.teams.find(t => t.teamID === teamId);
    return (team as any)?.tasksCount || 0;
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