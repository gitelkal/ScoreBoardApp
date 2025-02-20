import { Component, inject } from '@angular/core';
import { AdminService } from '@app/core/services/AdminService/admin.service';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AddScoreboardComponent } from '../add-scoreboard/add-scoreboard.component';
import { ManageTeamsComponent } from '../manage-teams/manage-teams.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    FormsModule,
    AddScoreboardComponent,
    ManageTeamsComponent,
  ],
  providers: [AdminService],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent {
  adminService = inject(AdminService);
  getAllAdmins$ = this.adminService.getAllAdmins();
  router = inject(Router);

  searchQuery: string = '';
  sortBy: string = 'name';
  admins: any[] = [];

  constructor() {
    this.adminService.getAllAdmins().subscribe(
      (data) => {
        console.log('Admins hämtade:', data); // 🔍 Se vad API:et returnerar
        this.admins = data;
      },
      (error) => {
        console.error('Fel vid hämtning av admins:', error);
      }
    );
  }

  get sortedAdmins() {
    if (!this.filteredAdmins || this.filteredAdmins.length === 0) return [];
    return this.filteredAdmins.sort((a: any, b: any) => {
      if (!this.sortBy) return 0;
      if (this.sortBy === 'name') return a.firstname.localeCompare(b.firstname);
      if (this.sortBy === 'date') {
        return (
          new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
        );
      }
      return 0;
    });
  }

  // 🟢 Navigera till admin-detaljer
  handleAdminClick(admin: any) {
    console.log('Admin clicked:', admin);
    this.router.navigate(['/admin', admin.adminID]);
  }

  get filteredAdmins() {
    return this.admins.filter((admin: any) =>
      (admin.firstname + ' ' + admin.lastname)
        .toLowerCase()
        .includes(this.searchQuery.toLowerCase())
    );
  }

  handleScoreboardCreated(scoreboardData: any) {
    this.adminService.createCompetition(scoreboardData).subscribe(
      (response) => {
        console.log('Tävling skapad:', response);
        alert('Tävling skapad!');
      },
      (error) => {
        console.error('Fel vid skapande av tävling:', error);
        alert('Något gick fel vid skapandet av tävling.');
      }
    );
  }

  handleTeamCreated(teamData: any) {
    console.log('Nytt lag skapat:', teamData);
    alert(`Laget "${teamData.teamName}" har skapats!`);
  }

  handleTeamDeleted(teamData: any) {
    console.log('Bortaget lag med ID:', teamData);
    alert(`Laget med ID "${teamData}" har tagits bort!`);
  }

  handleTeamUpdated(teamData: any) {
    console.log('Lag uppdaterat:', teamData);
    alert(`Laget "${teamData.name}" har uppdaterats!`);
  }
}
