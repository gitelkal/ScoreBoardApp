import { Component, EventEmitter, Output, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgForOf } from '@angular/common';
import { CommonModule } from '@angular/common';
import { TeamService } from '@app/core/services/TeamService/team.service'; // ✅ Importera TeamService

@Component({
  selector: 'app-manage-teams',
  standalone: true,
  imports: [FormsModule, NgForOf, CommonModule],
  templateUrl: './manage-teams.component.html',
  styleUrl: './manage-teams.component.css'
})
export class ManageTeamsComponent implements OnInit {
  private teamService = inject(TeamService); // ✅ Injicera TeamService

  @Output() teamCreated = new EventEmitter<any>();
  @Output() teamDeleted = new EventEmitter<number>();
  @Output() teamUpdated = new EventEmitter<any>();

  teams: any[] = []; // ✅ Lista för lag från backend
  teamData = { id: null, name: '' }; // ✅ Data för formuläret

  ngOnInit() {
    this.fetchTeams();
  }

  fetchTeams() {
    this.teamService.getAllTeams().subscribe(
      (data) => {
        this.teams = data; // ✅ Uppdatera laglistan från backend
      },
      (error) => {
        console.error('Fel vid hämtning av lag:', error);
      }
    );
  }

  createTeam() {
    if (!this.teamData.name) {
      alert('Lagnamn krävs!');
      return;
    }
    this.teamService.createTeam({ name: this.teamData.name }).subscribe(
      (response) => {
        console.log('Lagt till lag:', response);
        this.fetchTeams(); // ✅ Uppdatera listan
        this.teamCreated.emit(response);
      },
      (error) => {
        console.error('Fel vid skapande av lag:', error);
        alert('Något gick fel vid skapandet av lag.');
      }
    );
    this.resetForm();
  }

  deleteTeam() {
    if (!this.teamData.id) {
      alert('Välj ett lag att radera!');
      return;
    }
    this.teamService.deleteTeam(this.teamData.id).subscribe(
      () => {
        console.log('Lag raderat:', this.teamData.id);
        this.fetchTeams(); // ✅ Uppdatera listan efter radering
        this.teamDeleted.emit(Number(this.teamData.id));
      },
      (error) => {
        console.error('Fel vid borttagning av lag:', error);
        alert('Något gick fel vid borttagning av lag.');
      }
    );
  }

  resetForm() {
    this.teamData = { id: null, name: '' };
  }
}
