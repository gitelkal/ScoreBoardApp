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

    displayedColumns: string[] = ['id', 'teamName', 'points', 'date', 'admin'];
    dataSource = [];
  
    adminMapping: Record<string, string> = {
      'admin1': 'Alice',
      'admin2': 'Bob',
      'admin3': 'Charlie',
      'admin4': 'Diana'
    };

    teams: Team[] = [
      new Team(1, 'Team A', 10, new Date('2025-02-06'), 'Admin A'),
      new Team(2, 'Team B', 15, new Date('2025-02-06'), 'Admin B'),
      new Team(3, 'Team C', 20, new Date('2025-02-06'), 'Admin C')
    ];
  
    getAdminName(adminKey: string): string {
      return this.adminMapping[adminKey] || 'Unknown Admin';
    }
  }