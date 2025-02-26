import {
  Component,
  EventEmitter,
  Output,
  OnInit,
  inject,
  ElementRef,
  ViewChild,
  HostListener,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgForOf } from '@angular/common';
import { CommonModule } from '@angular/common';
import { TeamService } from '@app/core/services/TeamService/team.service';

@Component({
  selector: 'app-manage-teams',
  standalone: true,
  imports: [FormsModule, NgForOf, CommonModule],
  templateUrl: './manage-teams.component.html',
  styleUrl: './manage-teams.component.css',
})
export class ManageTeamsComponent implements OnInit {
  private teamService = inject(TeamService);

  @Output() teamCreated = new EventEmitter<any>();
  @Output() teamDeleted = new EventEmitter<number>();

  teams: any[] = [];
  filteredTeams: any[] = [];
  searchQuery: string = '';
  showDropdown: boolean = false;
  selectedTeamId?: number;
  selectedTeamName?: string;
  teamData: { teamID: number; name: string } = { teamID: 0, name: '' }; // Standardvärde

  @ViewChild('dropdown') dropdown!: ElementRef;

  ngOnInit() {
    this.fetchTeams();
  }

  fetchTeams() {
    this.teamService.getAllTeams().subscribe(
      (data) => {
        this.teams = data;
        this.filteredTeams = data;
      },
      (error) => {
        console.error('Fel vid hämtning av lag:', error);
      }
    );
  }

  // 🔹 Skapa nytt lag

  createTeam() {
    if (!this.teamData || !this.teamData.name.trim()) {
      alert('Lagnamn krävs!');
      return;
    }

    const payload = { teamID: 0, teamName: this.teamData.name };

    console.log('📤 Skickar till backend:', JSON.stringify(payload, null, 2));

    this.teamService.createTeam(payload).subscribe(
      (response) => {
        console.log('✅ Lagt till lag:', response);

        if (response) {
          console.log(`Nytt lag skapat:`, response);
          this.fetchTeams(); // Uppdatera listan
          this.teamCreated.emit(response);
          this.teamData = { teamID: 0, name: '' }; // Återställ formuläret
        } else {
          console.warn(' API returnerade null! Kolla backend.');
          alert('API returnerade null. Kontrollera backend.');
        }
      },
      (error) => {
        console.error('Fel vid skapande av lag:', error);
        alert('Något gick fel vid skapandet av lag.');
      }
    );
  }

  // 🔹 Filtrera lag i sökrutan
  filterTeams() {
    if (!this.searchQuery.trim()) {
      this.filteredTeams = [];
      this.showDropdown = false;
      return;
    }

    this.filteredTeams = this.teams.filter((team) =>
      team.teamName.toLowerCase().includes(this.searchQuery.toLowerCase())
    );

    this.showDropdown = this.filteredTeams.length > 0;
  }

  // 🔹 Välj lag från dropdown
  selectTeam(team: any) {
    console.log('Lag valt:', team); // 🔹 Debugging – ser vi detta i konsolen?

    this.searchQuery = team.teamName; // 🔹 Fyller i sökfältet
    this.selectedTeamId = team.teamID; // 🔹 Sparar ID för borttagning
    this.showDropdown = false; // 🔹 Stänger dropdownen
  }

  // 🔹 Ta bort lag
  deleteTeam() {
    if (!this.selectedTeamId) {
      alert('Välj ett lag att radera!');
      return;
    }
    this.teamService.deleteTeam(this.selectedTeamId).subscribe(
      () => {
        console.log('✅ Lag raderat:', this.selectedTeamId);
        this.fetchTeams(); // Uppdatera listan efter radering
        this.teamDeleted.emit(this.selectedTeamId!);

        this.searchQuery = ''; // 🔹 Rensa inputfältet efter radering
        this.selectedTeamId = undefined;
      },
      (error) => {
        console.error('Fel vid borttagning av lag:', error);
        alert('Något gick fel vid borttagning av lag.');
      }
    );
  }

  // 🔹 Stänger dropdown om du klickar utanför
  @HostListener('document:click', ['$event'])
  closeDropdown(event: Event) {
    if (!this.dropdown?.nativeElement.contains(event.target)) {
      this.showDropdown = false;
    }
  }

  // resetForm() {
  //   this.teamData = { id: 0, name: '' };
  // }
}
