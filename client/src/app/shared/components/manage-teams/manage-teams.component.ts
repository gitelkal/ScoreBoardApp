import { Component, OnInit, inject, Output, EventEmitter,HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TeamService } from '@app/core/services/teamService/team.service';
import { UserService } from '@app/core/services/userService/user.service';
import { TeamUsersService } from '@app/core/services/teamUsersService/team-users.service';

@Component({
  selector: 'app-manage-teams',
  standalone: true,
  templateUrl: './manage-teams.component.html',
  styleUrl: './manage-teams.component.css',
  imports: [CommonModule, FormsModule],
})
export class ManageTeamsComponent implements OnInit {
  private teamService = inject(TeamService);
  private userService = inject(UserService);
  private teamUsersService = inject(TeamUsersService);

  @Output() teamCreated = new EventEmitter<any>();

  // Form fält och valda objekt
  teamName: string = '';
  searchManageQuery: string = '';
  searchListQuery: string = '';
  searchUserQuery: string = '';
  searchTeamQuery: string = '';
  searchUserToRemoveQuery: string = '';
  searchRemoveTeamQuery: string = '';
  sortBy: string = 'name';

  selectedUser: any = null;
  selectedTeam: any = null;
  selectedRemoveTeam: any = null;

  users: any[] = [];
  teams: any[] = [];
  filteredUsers: any[] = [];
  filteredTeams: any[] = [];

  activeDropdown:
    | 'user'
    | 'team'
    | 'manageTeams'
    | 'removeUser'
    | 'removeTeam'
    | null = null;

  ngOnInit() {
    this.fetchUsers();
    this.fetchTeams();
  }

  fetchUsers() {
    this.userService.getAllUsers().subscribe((users) => {
      this.users = users;
      this.filteredUsers = users;
    });
  }

  fetchTeams() {
    this.teamService.getAllTeams().subscribe((teams) => {
      this.teams = teams;
      this.filteredTeams = teams;
    });
  }

  filterUsers(query: string) {
    this.filteredUsers = query.trim()
      ? this.users.filter((u) =>
          u.username.toLowerCase().includes(query.toLowerCase())
        )
      : [...this.users];
  }

  filterTeams(query: string) {
    this.filteredTeams = query.trim()
      ? this.teams.filter((t) =>
          t.teamName.toLowerCase().includes(query.toLowerCase())
        )
      : [...this.teams];
  }

  filterManageTeams(query: string) {
    this.filterTeams(query);
  }

  filterTeamList() {
    this.filteredTeams = this.searchListQuery.trim()
      ? this.teams.filter((t) =>
          t.teamName.toLowerCase().includes(this.searchListQuery.toLowerCase())
        )
      : [...this.teams];
  }

  selectUser(user: any, mode: 'add' | 'remove' = 'add') {
    this.selectedUser = user;
    if (mode === 'add') {
      this.searchUserQuery = user.username;
    } else {
      this.searchUserToRemoveQuery = user.username;
    }
    this.activeDropdown = null;
  }

  selectTeam(team: any, mode: 'add' | 'remove' = 'add') {
    if (mode === 'add') {
      this.selectedTeam = team;
      this.searchTeamQuery = team.teamName;
    } else {
      this.selectedRemoveTeam = team;
      this.searchRemoveTeamQuery = team.teamName;
    }

    this.activeDropdown = null;
  }

  filterTeam(query: string) {
    this.filterTeams(query);
  }

  get sortedTeams() {
    return [...this.filteredTeams].sort((a, b) => {
      if (this.sortBy === 'name') {
        return a.teamName.localeCompare(b.teamName);
      }
      return 0;
    });
  }

  createTeam() {
    if (!this.teamName.trim()) {
      alert('Lagnamn krävs!');
      return;
    }
    const payload = { teamID: 0, teamName: this.teamName };
    this.teamService.createTeam(payload).subscribe(
      (response: any) => {
        console.log('✅ Lagt till lag:', response);
        this.fetchTeams();
        this.teamCreated.emit(response);
        this.teamName = '';
      },
      (error) => {
        console.error('Fel vid skapande av lag:', error);
        alert('Något gick fel vid skapandet av lag.');
      }
    );
  }

  updateTeam() {
    if (!this.selectedTeam?.teamID || !this.selectedTeam.teamName?.trim()) {
      alert('Välj lag och ange nytt namn.');
      return;
    }

    this.teamService
      .updateTeam(this.selectedTeam.teamID, this.selectedTeam)
      .subscribe(() => {
        this.fetchTeams();
        alert('Lag uppdaterat!');
      });
  }
  deleteTeam() {
    if (!this.selectedTeam?.teamID) {
      alert('Välj ett lag att ta bort!');
      return;
    }

    this.teamService.deleteTeam(this.selectedTeam.teamID).subscribe(
      () => {
        alert('Lag borttaget!');
        this.fetchTeams();
        this.selectedTeam = null;
      },
      (error) => {
        console.error('Fel vid borttagning av lag:', error);
        alert('Något gick fel vid borttagning.');
      }
    );
  }

  modifyTeamMembership(action: 'add' | 'remove') {
    if (!this.selectedTeam?.teamID || !this.selectedUser?.userId) {
      alert('Välj både lag och användare först!');
      return;
    }

    const actionCall =
      action === 'add'
        ? this.teamUsersService.joinTeam(
            this.selectedUser.userId,
            this.selectedTeam.teamID
          )
        : this.teamUsersService.removeUserFromTeam(
            this.selectedTeam.teamID,
            this.selectedUser.userId
          );

    actionCall.subscribe(() => {
      alert(
        `Användaren har ${
          action === 'add' ? 'lagts till' : 'tagits bort'
        } i laget.`
      );
      this.fetchTeams();
    });
  }

  removeUserFromTeam() {
    if (!this.selectedTeam?.teamID || !this.selectedUser?.userId) {
      alert('Välj både lag och användare först!');
      return;
    }

    this.teamUsersService
      .removeUserFromTeam(this.selectedTeam.teamID, this.selectedUser.userId)
      .subscribe(() => {
        alert('Användare borttagen från laget!');
        this.fetchTeams();
      });
  }
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    console.log('klickat element:', target);

    // Om klicket inte träffar någon input eller dropdown, stäng dropdown
    if (
      !target.closest('.dropdown-container') &&
      !target.closest('.input-field')
    ) {
      this.activeDropdown = null;
    }
  }
}
