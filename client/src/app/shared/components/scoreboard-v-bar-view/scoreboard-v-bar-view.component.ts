import { Component } from '@angular/core';
import { ScoreboardBaseComponent } from '../scoreboard-base/scoreboard-base.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-scoreboard-v-bar-view',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, RouterModule],
  templateUrl: './scoreboard-v-bar-view.component.html',
  styleUrls: ['./scoreboard-v-bar-view.component.css']
})
export class ScoreboardVBarViewComponent extends ScoreboardBaseComponent {
  isViewDropdownOpen = false;
  isHorizontalView: boolean = true;
  teamColorAssignments: Map<string, string> = new Map();

  private readonly teamColors: string [] = [
    'linear-gradient(to top, #b30000, #ff4d4d)',
    'linear-gradient(to top, #ffcc00, #ffea00)',
    'linear-gradient(to top, #ff6600, #ff9933)',
    'linear-gradient(to top, #b30086, #ff00ff)',
    'linear-gradient(to top, #0080ff, #00cfff)',
    'linear-gradient(to top, #008000, #00ff00)',
    'linear-gradient(to top, #ff1493, #ff69b4)',
    'linear-gradient(to top, #4b0082, #8a2be2)', 
    'linear-gradient(to top, #ff4500, #ff8c00)',
    'linear-gradient(to top, #4682b4, #87ceeb)' 
];

  toggleViewDropdown(): void {
    this.isViewDropdownOpen = !this.isViewDropdownOpen;
  }

  toggleView(): void {
    this.isHorizontalView = !this.isHorizontalView;
  }

  override setPoints(teamId: number, points: number) {
    if (!this.scoreboardID) return;
    this.scoreboardTeamsService.setScoreboardTeamPoints(this.scoreboardID, teamId, points)
      .subscribe();
  }

  getBarHeight(points: number): number {
    const maxPoints = Math.max(...(this.scoreboardResponseSubject.value?.scoreboard.teams.map(team => team.points) || [1])) || 1;
    return (points / maxPoints) * 300;
  }

  generateRandomGradient(): string {
    const randomColor = () => Math.floor(Math.random() * 16777215).toString(16);
    return `linear-gradient(to top, #${randomColor()}, #${randomColor()})`;
  }

  getTeamColor(teamName: string, existingAssignments: Map<string, string>): string {
    return existingAssignments.get(teamName) || this.assignNewColor(teamName, existingAssignments);
  }

  private assignNewColor(teamName: string, existingAssignments: Map<string, string>): string {
  const assignedColor = existingAssignments.size < this.teamColors.length  
    ? this.teamColors[existingAssignments.size] : this.generateRandomGradient();
  existingAssignments.set(teamName, assignedColor);
  return assignedColor; 
  }
}
