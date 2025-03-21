import { Component } from '@angular/core';
import { ScoreboardBaseComponent } from '../scoreboard-base/scoreboard-base.component';
import { CommonModule, AsyncPipe, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterModule, RouterLink } from '@angular/router';

@Component({
  selector: 'app-scoreboard-details',
  standalone: true,
  imports: [CommonModule, AsyncPipe, NgIf, NgFor, FormsModule, MatDialogModule, RouterModule, RouterLink],
  templateUrl: './scoreboard-details.component.html',
  styleUrls: ['./scoreboard-details.component.css']
})
export class ScoreboardDetailsComponent extends ScoreboardBaseComponent {
  isViewDropdownOpen = false;

  toggleViewDropdown() {
    this.isViewDropdownOpen = !this.isViewDropdownOpen;
  }
}
