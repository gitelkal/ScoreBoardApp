import { Component } from '@angular/core';
import { ScoreboardBaseComponent } from '../scoreboard-base/scoreboard-base.component';
import { CommonModule, AsyncPipe, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-scoreboard-staple-view',
  standalone: true,
  imports: [CommonModule, AsyncPipe, NgIf, NgFor, FormsModule, MatDialogModule, RouterModule],
  templateUrl: './scoreboard-staple-view.component.html',
  styleUrls: ['./scoreboard-staple-view.component.css']
})
export class ScoreboardStapleViewComponent extends ScoreboardBaseComponent {}
