import { Component, inject } from '@angular/core';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Observable } from 'rxjs';

import { AdminService } from '@app/core/services/adminService/admin.service';
import { UserService } from '@app/core/services/userService/user.service';
import { ScoreboardService } from '@app/core/services/scoreboardService/scoreboard.service'; //
import { AuthService } from '@app/core/services/auth/auth.service';
import { TeamService } from '@app/core/services/teamService/team.service';

import { ManageTeamsComponent } from '../manage-teams/manage-teams.component';
import { ManageScoreboardComponent } from '../manage-scoreboard/manage-scoreboard.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    FormsModule,
    ManageTeamsComponent,
    ManageScoreboardComponent,
    AsyncPipe,
  ],
  providers: [AdminService, ScoreboardService, UserService, TeamService],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent {
  // Admin
  adminService = inject(AdminService);
  getAllAdmins$ = this.adminService.getAllAdmins();
  admins: any[] = [];
  isAdmin!: Observable<boolean>;
  openedFromAdmins: boolean = false;

  //User
  userService = inject(UserService);
  getAllUsers$ = this.userService.getAllUsers();
  users: any[] = [];
  userID: number = 0;
  searchUserQuery: string = '';

  // Team
  teamService = inject(TeamService);
  teams: any[] = [];
  searchTeamQuery: string = '';

  //övrigt
  scoreboardService = inject(ScoreboardService);
  searchQuery: string = '';
  sortBy: string = 'name';
  selectedUser: any = null;

  constructor(private auth: AuthService, private router: Router) {
    this.adminService.getAllAdmins().subscribe(
      (data) => {
        console.log('Admins hämtade:', data);
        this.admins = data;
      },
      (error) => {
        console.error('Fel vid hämtning av admins:', error);
      }
    );
    this.isAdmin = this.auth.isAdmin;

    this.userService.getAllUsers().subscribe(
      (data) => {
        console.log('Users hämtade:', data);
        this.users = data;
      },
      (error) => {
        console.error('Fel vid hämtning av users:', error);
      }
    );
    this.teamService.getAllTeams().subscribe(
      (data) => {
        console.log('teams hämtade:', data);
        this.teams = data;
      },
      (error) => {
        console.error('Fel vid hämtning av teams:', error);
      }
    );
  }
  // Admin
  get sortedAdmins() {
    if (!this.filteredAdmins || this.filteredAdmins.length === 0) return [];
    return this.filteredAdmins.sort((a: any, b: any) => {
      if (!this.sortBy) return 0;
      if (this.sortBy === 'name') return a.username.localeCompare(b.username);
      if (this.sortBy === 'nameReversed')
        return b.username.localeCompare(a.username);

      return 0;
    });
  }

  handleAdminClick(admin: any) {
    this.selectedUser = admin;
    this.openedFromAdmins = true;
  }

  get filteredAdmins() {
    if (!this.admins?.length) return [];

    return this.admins.filter((admin: any) =>
      admin.username.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }
  makeAdmin(user: any) {
    if (!confirm(`Vill du göra ${user.username} till admin?`)) return;

    const payload = { username: user.username };

    this.adminService.makeAdmin(payload).subscribe(
      () => {
        alert(`${user.username} är nu admin!`);
        this.selectedUser = null;
      },
      (error) => {
        alert(error.error || 'Något gick fel, försök igen.');
      }
    );
  }

  deleteAdmin(admin: any) {
    this.adminService.deleteAdmin(admin.adminID).subscribe(
      (response) => {
        this.admins = this.admins.filter((a) => a.adminID !== admin.adminID);

        alert('Användaren har tagits bort!');
      },
      (error) => {
        alert('Något gick fel vid borttagning av admin.');
      }
    );
  }
  // __________________User______________________
  get sortedUsers() {
    if (!this.filteredUsers || this.filteredUsers.length === 0) return [];
    return this.filteredUsers.sort((a: any, b: any) => {
      if (!this.sortBy) return 0;
      if (this.sortBy === 'name') return a.username.localeCompare(b.username);
      if (this.sortBy === 'nameReversed')
        return b.username.localeCompare(a.username);
      return 0;
    });
  }
  handleUserClick(user: any) {
    this.selectedUser = user;
    this.openedFromAdmins = false;
  }

  get filteredUsers() {
    if (!this.users?.length) return [];

    return this.users.filter((user: any) =>
      user.username.toLowerCase().includes(this.searchUserQuery.toLowerCase())
    );
  }

  goToUserPage(user: any) {
    if (!user?.userId) return;

    this.router.navigate(['/user', user.userId]).catch((error) => {
      alert('Något gick fel vid navigering.');
    });
  }

  deleteUser(user: any) {
    this.userService.deleteUser(user.userId).subscribe(
      (response) => {
        this.users = this.users.filter((u) => u.userId !== user.userId);
        alert('Användaren har tagits bort!');
      },
      (error) => {
        alert('Något gick fel vid borttagning av användare.');
      }
    );
  }
  // Team
  get sortedTeam() {
    if (!this.filteredTeams || this.filteredTeams.length === 0) return [];
    return this.filteredTeams.sort((a: any, b: any) => {
      if (!this.sortBy) return 0;
      if (this.sortBy === 'name') return a.teamName.localeCompare(b.teamName);
      if (this.sortBy === 'nameReversed')
        return b.teamName.localeCompare(a.teamName);
      return 0;
    });
  }

  get filteredTeams() {
    if (!this.teams?.length) return [];

    return this.teams.filter((team: any) =>
      team.teamName.toLowerCase().includes(this.searchTeamQuery.toLowerCase())
    );
  }

  goToTeamPage(team: any) {
    if (!team || !team.teamID) {
      alert('Något gick fel: teamID saknas.');
      return;
    }

    this.router.navigate(['/team', team.teamID]).catch((error) => {
      alert('Något gick fel vid navigering.');
      console.error('Navigeringsfel:', error);
    });
  }
  // Handle...

  handleScoreboardCreated(scoreboardData: any) {
    this.scoreboardService.createScoreboard(scoreboardData).subscribe(
      (response) => {
        alert('Tävling skapad!');
      },
      (error) => {
        alert('Något gick fel vid skapandet av tävling.');
      }
    );
  }

  handleScoreboardUpdated(scoreboardData: any) {
    if (!scoreboardData || !scoreboardData.scoreboardId) {
      alert('Ingen tävlingspoängtavla vald för uppdatering!');
      return;
    }

    this.scoreboardService
      .updateScoreboard(scoreboardData.scoreboardId, scoreboardData)
      .subscribe(
        (response) => {
          alert('Tävlingspoängtavlan har uppdaterats!');
        },
        (error) => {
          alert('Något gick fel vid uppdatering av tävling.');
        }
      );
  }

  handleTeamCreated(teamData: any) {
    if (teamData) {
      alert(`Laget "${teamData.teamName}" har skapats!`);
    } else {
      alert('Laget har skapats.');
    }
  }

  handleTeamDeleted(teamData: any) {
    alert(`Laget med ID "${teamData}" har tagits bort!`);
  }

  handleTeamUpdated(teamData: any) {
    alert(`Laget "${teamData.name}" har uppdaterats!`);
  }
}
