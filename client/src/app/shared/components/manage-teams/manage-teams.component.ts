import {
  Component,
  OnInit,
  inject,
  HostListener,
  Output,
  EventEmitter,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TeamService } from '@app/core/services/teamService/team.service';
import { ScoreboardService } from '@app/core/services/scoreboardService/scoreboard.service';
import { TeamUsersService } from '@app/core/services/teamUsersService/team-users.service';
import { UserService } from '@app/core/services/userService/user.service';
import { Subject, takeUntil } from 'rxjs';
@Component({
  selector: 'app-manage-teams',
  standalone: true,
  templateUrl: './manage-teams.component.html',
  styleUrl: './manage-teams.component.css',
  imports: [CommonModule, FormsModule],
})
export class ManageTeamsComponent implements OnInit, OnDestroy {
  private teamService = inject(TeamService);
  private scoreboardService = inject(ScoreboardService);
  private teamUsersService = inject(TeamUsersService);
  private userService = inject(UserService);

  @Output() teamCreated = new EventEmitter<any>();

  selectedTeams: any[] = [];
  selectedTeam: any = null;
  selectedScoreboard: any = null;
  selectedUser: any = null;

  teams: any[] = [];
  teamName: string = '';

  searchManageQuery: string = '';
  searchUserQuery: string = '';
  searchTeamQuery: string = '';
  searchUserToRemoveQuery: string = '';
  searchScoreboardQuery: string = '';

  sortBy: string = 'name';

  scoreboards: any[] = [];
  users: any[] = [];

  filteredUsers: any[] = [];
  filteredTeams: any[] = [];
  filteredScoreboards: any[] = [];

  
  activeDropdown:
  | 'user'
  | 'team'
  | 'manageTeams'
  | 'removeUser'
  | 'removeTeam'
  | 'scoreboard'
  | null = null;
  
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.fetchTeams();
    this.fetchUsers();
    this.fetchScoreboards();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchTeams() {
    this.teamService.getAllTeams().then((teams) => {
      this.teams = teams;
      this.filteredTeams = teams;
    });
  }

  fetchUsers() {
    this.userService.getAllUsers().then((users) => {
      this.users = users;
      this.filteredUsers = users;
    });
  }

  fetchScoreboards() {
    this.scoreboardService.getAllScoreboards().then((scoreboards) => {
      this.scoreboards = scoreboards;
      this.filteredScoreboards = scoreboards;
    });
  }

  // Filtrera lag baserat på sökfältet
  filterTeams(query: string) {
    this.filteredTeams = query.trim()
      ? this.teams.filter((t) =>
          t.teamName.toLowerCase().includes(query.toLowerCase())
        )
      : [...this.teams];
  }

  // Filtrera scoreboards baserat på sökfältet
  filterScoreboards(query: string) {
    this.filteredScoreboards = query.trim()
      ? this.scoreboards.filter((s) =>
          s.name.toLowerCase().includes(query.toLowerCase())
        )
      : [...this.scoreboards];
  }

  filterUsers(query: string) {
    this.filteredUsers = query.trim()
      ? this.users.filter((u) =>
          u.username.toLowerCase().includes(query.toLowerCase())
        )
      : [...this.users];
  }

  filterManageTeams(query: string) {
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
  // När ett lag väljs från listan
  selectTeam(team: any, mode: 'add' | 'remove' = 'add') {
    this.selectedTeam = team;
    this.searchManageQuery = team.teamName;
    this.searchTeamQuery = team.teamName;
    this.activeDropdown = null;
  }
  selectTeamsForScoreboard(team: any) {
    if (!this.selectedTeams.some((t) => t.teamID === team.teamID)) {
      this.selectedTeams.push(team);
    }

    this.searchTeamQuery = '';
    this.activeDropdown = null;
  }

  // När en scoreboard väljs från listan
  selectScoreboard(scoreboard: any) {
    this.selectedScoreboard = scoreboard;
    this.searchScoreboardQuery = scoreboard.name;
    this.activeDropdown = null;
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
  // Ta bort ett lag från den valda listan
  createTeam() {
    if (!this.teamName.trim()) {
      alert('Lagnamn krävs!');
      return;
    }
    const payload = { teamID: 0, teamName: this.teamName };
    this.teamService.createTeam(payload).pipe(
      takeUntil(this.destroy$)
    ).subscribe(
      (response: any) => {
        console.log('Lagt till lag:', response);
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
        this.selectedTeam = null;
        this.teamName = '';
        this.searchManageQuery = '';
      });
  }
  deleteTeam() {
    if (!this.selectedTeam?.teamID) {
      alert('Välj ett lag att ta bort!');
      return;
    }
    if (confirm('Är du säker på att du vill ta bort laget?')) {
      this.teamService.deleteTeam(this.selectedTeam.teamID).subscribe(
        () => {
          alert('Lag borttaget!');
          this.fetchTeams();
          this.selectedTeam = null;
          this.teamName = '';
          this.searchManageQuery = '';
        },
        (error) => {
          console.error('Fel vid borttagning av lag:', error);
          alert('Något gick fel vid borttagning.');
        }
      );
    }
  }

  // Tar bort ett lag från  valda lag listan 
  removeTeamFromList(team: any) {
    this.selectedTeams = this.selectedTeams.filter(
      (t) => t.teamID !== team.teamID
    );
  }

  // Lägg till alla valda lag i scoreboard
  addTeamsToScoreboard() {
    if (!this.selectedTeams.length || !this.selectedScoreboard?.scoreboardId) {
      alert('Välj minst ett lag och en scoreboard!');
      return;
    }

    this.selectedTeams.forEach((team) => {
      this.scoreboardService
        .addTeamToScoreboard(this.selectedScoreboard.scoreboardId, team.teamID)
        .subscribe(
          () => {
            console.log(`✅ Lag ${team.teamName} tillagd i scoreboard`);
          },
          (error) => {
            console.error(`Fel vid tillägg av lag ${team.teamName}:`, error);
          }
        );
    });

    alert('Alla valda lag har skickats för tillägg!');
    this.selectedTeams = [];
    this.selectedScoreboard = null;
    this.searchTeamQuery = '';
    this.searchScoreboardQuery = '';
  }

  modifyTeam(action: 'add' | 'remove') {
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

    actionCall.subscribe(
      () => {
        alert(
          `Användaren har ${
            action === 'add' ? 'lagts till' : 'tagits bort'
          } i laget.`
        );
        this.fetchTeams();
        this.selectedUser = null;
        this.selectedTeam = null;
      },
      (error) => {
        if (error.status === 404 && action === 'remove') {
          alert('Användaren finns inte i detta lag.');
        } else {
          console.error('Fel vid hantering av lag:', error);
          alert('Något gick fel vid ändringen.');
        }
      }
    );
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

    if (
      !target.closest('.dropdown-container') &&
      !target.closest('.input-field')
    ) {
      this.activeDropdown = null;
    }
  }
}
