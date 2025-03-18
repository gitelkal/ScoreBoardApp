import { Component } from '@angular/core';
import { ScoreboardBaseComponent } from '../scoreboard-base/scoreboard-base.component';
import { CommonModule, AsyncPipe, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-scoreboard-v-bar-view',
  standalone: true,
  imports: [CommonModule, AsyncPipe, NgIf, NgFor, FormsModule, MatDialogModule, RouterModule],
  templateUrl: './scoreboard-v-bar-view.component.html',
  styleUrls: ['./scoreboard-v-bar-view.component.css']
})
export class ScoreboardVBarViewComponent extends ScoreboardBaseComponent {
  isViewDropdownOpen = false;


  toggleViewDropdown() {
    this.isViewDropdownOpen = !this.isViewDropdownOpen;
  }

  isHorizontalView: boolean = true;

toggleView() {
  this.isHorizontalView = !this.isHorizontalView;
}
}
