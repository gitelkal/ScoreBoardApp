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
import { UserService } from '@app/core/services/userService/user.service';
import { TeamUsersService } from '@app/core/services/teamUsersService/team-users.service';

@Component({
  selector: 'app-manage-teams',
  standalone: true,
  imports: [FormsModule, NgForOf, CommonModule],
  templateUrl: './manage-teams.component.html',
  styleUrl: './manage-teams.component.css',
})
export class ManageTeamsComponent implements OnInit {
  private teamService = inject(TeamService);
  private userService = inject(UserService);
  private teamUsersService = inject(TeamUsersService);

  @Output() teamCreated = new EventEmitter<any>();
  @Output() teamDeleted = new EventEmitter<number>();
  sortBy: string = 'name';

  teams: any[] = [];

  filteredTeams: any[] = [];
  selectedTeam: any = { teamID: null, teamName: '' };
  searchManageQuery: string = '';
  searchListQuery: string = '';

  searchTeamToAddQuery: string = '';
  searchTeamToRemoveQuery: string = '';
  selectedTeamToAdd: any = null;
  selectedTeamToRemove: any = null;

  users: any[] = [];
  searchUserQuery: string = '';
  filteredUsers: any[] = [];
  selectedUser: any = null;
  activeDropdown: 'addUser' | 'removeUser' | 'team' | null = null;

  searchUserToAddQuery: string = '';
  searchUserToRemoveQuery: string = '';
  selectedUserToAdd: any = null;
  selectedUserToRemove: any = null;

  showDropdown: boolean = false;
  @ViewChild('dropdown') dropdown!: ElementRef;

  ngOnInit() {
    this.fetchTeams(); // Hämta lag
    this.fetchUsers(); // Hämta användare
  }

  fetchUsers() {
    this.userService.getAllUsers().subscribe(
      (data: any) => {
        this.users = data;
        this.filteredUsers = data;
      },
      (error: any) => {
        console.error('Fel vid hämtning av users:', error);
      }
    );
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
      (response: any) => {
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
    console.log('Alla teams:', this.teams);
    console.log('Sökterm:', this.searchManageQuery);

    this.filteredTeams = this.searchManageQuery.trim()
      ? this.teams.filter((team) =>
          team.teamName
            .toLowerCase()
            .includes(this.searchManageQuery.toLowerCase())
        )
      : [...this.teams];

    console.log('Filtrerade teams:', this.filteredTeams);
  }

  // Filtrera lag i sökrutan
  filterTeamList() {
    this.filteredTeams = this.searchListQuery.trim()
      ? this.teams.filter((team) =>
          team.teamName
            .toLowerCase()
            .includes(this.searchListQuery.toLowerCase())
        )
      : [...this.teams];
  }
  // Sortera lag
  get sortedTeams() {
    return [...(this.filteredTeams || [])].sort((a, b) =>
      this.sortBy === 'name' ? a.teamName.localeCompare(b.teamName) : 0
    );
  }

  // 🔹 Välj lag från dropdown
  selectTeam(team: any) {
    if (!team || this.selectedTeam.teamID === team.teamID) return;
    this.selectedTeam = { ...team };

    this.searchManageQuery = team.teamName; // Denna som fyller iput med lagnamn
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

    this.teamService
      .updateTeam(this.selectedTeam.teamID, this.selectedTeam)
      .subscribe(
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

  // Sortera användare
  filterManageUser() {
    this.filteredUsers = this.searchUserQuery.trim()
      ? this.users.filter((user) =>
          user.userName
            .toLowerCase()
            .includes(this.searchUserQuery.toLowerCase())
        )
      : [...this.users];
  }
  //  Sortera användare
  filterUsers(query: string) {
    this.filteredUsers = query.trim()
      ? this.users.filter((user) =>
          user.username.toLowerCase().includes(query.toLowerCase())
        )
      : [...this.users];
  }

  // 🔹 Välj lag från dropdown
  selectUser(user: any) {
    this.selectedUser = user;
    this.searchUserQuery = user.username;
    this.activeDropdown = null; // Stänger dropdown
  }

  // Lägg till användare i lag
  joinTeam(user?: any): void {
    const userToAdd = user || this.selectedUser;

    if (!this.selectedTeam.teamID) {
      alert('Välj ett lag först!');
      return;
    }

    if (!userToAdd) {
      alert('Välj en användare att lägga till!');
      return;
    }
    console.log('Skickar till API:', {
      userID: userToAdd.userID,
      teamID: this.selectedTeam.teamID,
    });
    this.teamUsersService
      .joinTeam(userToAdd.userID, this.selectedTeam.teamID)

      .subscribe(
        (response) => {
          console.log('✅ Användare tillagd i lag:', response);
          this.fetchTeams();
          alert('Användare tillagd i lag!');
          this.selectedUser = null;
        },
        (error) => {
          console.error('Fel vid tillägg av användare i lag:', error);
          alert('Något gick fel vid tillägg av användare i lag.');
        }
      );
  }

  //  Ta bort användare från lag
  removeUserFromTeam(user?: any): void {
    const userToRemove = user || this.selectedUser;

    if (!userToRemove) {
      alert('Välj en användare att ta bort!');
      return;
    }

    if (!this.selectedTeam.teamID) {
      alert('Välj ett lag först!');
      return;
    }

    this.teamUsersService
      .removeUserFromTeam(this.selectedTeam.teamID, userToRemove.userID)
      .subscribe(
        () => {
          console.log(
            `✅ Användare ${userToRemove.username} borttagen från lag ${this.selectedTeam.teamName}`
          );
          this.fetchTeams();
          alert('Användaren har tagits bort!');
          this.selectedUser = null;
        },
        (error) => {
          console.error('Fel vid borttagning av användare:', error);
          alert('Något gick fel vid borttagning av användaren.');
        }
      );
  }
  selectUserToAdd(user: any) {
    this.selectedUserToAdd = user;
    this.searchUserToAddQuery = user.username;
    this.activeDropdown = null;
  }

  selectUserToRemove(user: any) {
    this.selectedUserToRemove = user;
    this.searchUserToRemoveQuery = user.username;
    this.activeDropdown = null;
  }

  selectTeamToAdd(team: any) {
    this.selectedTeamToAdd = team;
    this.searchTeamToAddQuery = team.teamname;
    this.activeDropdown = null;
  }

  selectTeamToRemove(team: any) {
    this.selectedTeamToRemove = team;
    this.searchTeamToRemoveQuery = team.teamname;
    this.activeDropdown = null;
  }

  // Stänger dropdown om du klickar utanför
  @HostListener('document:click', ['$event'])
  closeDropdown(event: Event) {
    const clickedElement = event.target as HTMLElement;
    console.log('Klickat element:', clickedElement);

    const allowedNames = [
      'searchUserQuery',
      'removeUserQuery',
      'searchUserToRemoveQuery',
      'searchUserToAddQuery',
      'searchListQuery',
    ];

    if (allowedNames.includes(clickedElement.getAttribute('name') || '')) {
      return;
    }

    this.activeDropdown = null;
  }
}
