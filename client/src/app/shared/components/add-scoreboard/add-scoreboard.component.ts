import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-scoreboard',
  standalone: true,  
  imports: [FormsModule],  
  templateUrl: './add-scoreboard.component.html',
  styleUrl: './add-scoreboard.component.css'
})
export class AddScoreboardComponent {
  @Output() scoreboardCreated = new EventEmitter<any>();

  scoreboardData = {
    name: '',
    startedAt: '',
    location: ''
  };

  createScoreboard() {
    if (!this.scoreboardData.name || !this.scoreboardData.startedAt) {
      alert('Tävlingsnamn och startdatum krävs!');
      return;
    }

    this.scoreboardCreated.emit(this.scoreboardData);
    this.resetForm();
  }

  resetForm() {
    this.scoreboardData = { name: '', startedAt: '', location: '' };
  }
}
