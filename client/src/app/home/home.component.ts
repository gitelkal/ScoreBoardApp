import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { Team } from '../models/team.model';
import { DatePipe } from '@angular/common';


export interface TeamData {
  teamName: string;
  points: number;
  date: string;
  admin: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatTableModule],  // Lägger till CommonModule och andra nödvändiga moduler 
  template: `
  <main>
  <p>Test i home</p>
  </main>
`,
  styleUrls: ['.//home.component.css']
})

export class HomeComponent {

  }