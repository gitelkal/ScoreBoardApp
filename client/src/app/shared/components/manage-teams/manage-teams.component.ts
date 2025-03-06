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
import { TeamService } from '@app/core/services/teamService/team.service';

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
  sortBy: string = 'name';
  teams: any[] = [];
  filteredTeams: any[] = [];
  showDropdown: boolean = false;
  selectedTeam: any = { teamID: null, teamName: '' };


  searchManageQuery: string = '';  // För hantera lag (ändra/tar bort)
  searchListQuery: string = '';    // För listan "Sök efter Teams"


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

  //Skapa nytt lag
  createTeam() {
    if (!this.selectedTeam.teamName.trim()) {
      alert('Lagnamn krävs!');
      return;
    }

    const payload = { teamID: 0, teamName: this.selectedTeam.teamName };

    this.teamService.createTeam(payload).subscribe(
      (response) => {
        console.log('✅ Lagt till lag:', response);
        this.fetchTeams();
        this.teamCreated.emit(response);
        this.selectedTeam = { teamID: null, teamName: '' };
      },
      (error) => {
        console.error('Fel vid skapande av lag:', error);
        alert('Något gick fel vid skapandet av lag.');
      }
    );
  }

  // Filtrera lag i sökrutan
  filterManageTeams() {
    this.filteredTeams = this.searchManageQuery.trim()
      ? this.teams.filter(team =>
          team.teamName.toLowerCase().includes(this.searchManageQuery.toLowerCase())
        )
      : [...this.teams];
  }
  
  filterTeamList() {
    this.filteredTeams = this.searchListQuery.trim()
      ? this.teams.filter(team =>
          team.teamName.toLowerCase().includes(this.searchListQuery.toLowerCase())
        )
      : [...this.teams];
  }
  


  get sortedTeams() {
    return [...(this.filteredTeams || [])].sort((a, b) => 
      this.sortBy === 'name' ? a.teamName.localeCompare(b.teamName) : 0
    );
  }
  
  





  // 🔹 Välj lag från dropdown
  selectTeam(team: any) {
    if (!team || this.selectedTeam.teamID === team.teamID) return;
    this.selectedTeam = { ...team };
    this.searchManageQuery = team.teamName; 
  }
  
  

  // 🔹 Ta bort lag
  deleteTeam() {
    if (!this.selectedTeam.teamID) {
      alert('Välj ett lag att radera!');
      return;
    }

    this.teamService.deleteTeam(this.selectedTeam.teamID).subscribe(
      () => {
        console.log('✅ Lag raderat:', this.selectedTeam.teamID);
        this.fetchTeams();
        this.teamDeleted.emit(this.selectedTeam.teamID);
        this.selectedTeam = { teamID: null, teamName: '' }; // Återställ formulär
      },
      (error) => {
        console.error('Fel vid borttagning av lag:', error);
        alert('Något gick fel vid borttagning av lag.');
      }
    );
  }

  // 🔹 Uppdatera lag
  updateTeam() {
    if (!this.selectedTeam.teamID || !this.selectedTeam.teamName.trim()) {
      alert('Välj ett lag och ange ett nytt namn!');
      return;
    }

    this.teamService.updateTeam(this.selectedTeam.teamID, this.selectedTeam).subscribe(
      (response) => {
        console.log('✅ Lag uppdaterat:', response);
        this.fetchTeams();
        alert('Lag uppdaterat!');
      },
      (error) => {
        console.error('Fel vid uppdatering av lag:', error);
        alert('Ett fel uppstod vid uppdatering.');
      }
    );
  }

  // 🔹 Stänger dropdown om du klickar utanför
  @HostListener('document:click', ['$event'])
  closeDropdown(event: Event) {
    const clickedElement = event.target as HTMLElement;
    console.log('Klickat element:', clickedElement);
    if (
      this.dropdown?.nativeElement.contains(clickedElement) || 
      clickedElement.getAttribute('name') === 'searchQuery' || 
      clickedElement.getAttribute('name') === 'name' ||
      clickedElement.getAttribute('name') === 'editname'
    ) {
      console.log('Dropdown ska vara kvar öppen');
      return; 
    }
    console.log('Dropdown stängs');
    this.showDropdown = false; 
  }
}
