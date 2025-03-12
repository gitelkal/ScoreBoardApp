import { Component, inject } from '@angular/core';
import { AdminService } from '@app/core/services/adminService/admin.service';
import { UserService } from '@app/core/services/userService/user.service';
import { ScoreboardService } from '@app/core/services/scoreboardService/scoreboard.service'; //
import { NgIf, NgFor, AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ManageTeamsComponent } from '../manage-teams/manage-teams.component';
import { ManageScoreboardComponent } from '../manage-scoreboard/manage-scoreboard.component';
import { AuthService } from '@app/core/services/auth/auth.service';
import { Observable } from 'rxjs';

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
  providers: [AdminService, ScoreboardService, UserService],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent {
  adminService = inject(AdminService);
  scoreboardService = inject(ScoreboardService);
  userService = inject(UserService);

  getAllAdmins$ = this.adminService.getAllAdmins();
  getAllUsers$ = this.userService.getAllUsers();

  router = inject(Router);

  searchQuery: string = '';
  searchUserQuery: string ='';

  sortBy: string = 'name';

  admins: any[] = [];
  users: any[] =[];

  isAdmin!: Observable<boolean>;
  selectedUser: any = null; 
  constructor(private auth: AuthService) {
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
  }
  

  get sortedAdmins() {
    if (!this.filteredAdmins || this.filteredAdmins.length === 0) return [];
    return this.filteredAdmins.sort((a: any, b: any) => {
      if (!this.sortBy) return 0;
      if (this.sortBy === 'name') return a.username.localeCompare(b.username);
      if (this.sortBy === 'date') {
        return (
          new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
        );
      }
      return 0;
    });
  }


  handleAdminClick(admin: any) {
    this.selectedUser = admin; 
  }

  get filteredAdmins() {
    if (!this.admins?.length) return [];

    return this.admins.filter((admin: any) =>
      admin.username.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }
// ________________________________________
get sortedUsers() {
  if (!this.filteredUsers || this.filteredUsers.length === 0) return [];
  return this.filteredUsers.sort((a: any, b: any) => {
    if (!this.sortBy) return 0;
    if (this.sortBy === 'name') return a.username.localeCompare(b.username);
    return 0;
  });
}


handleUserClick(user: any) {
  console.log("👆 Klickade på användare:", user);
  this.selectedUser = user; 
}



get filteredUsers() {
  if (!this.users?.length) return [];

  return this.users.filter((user: any) =>
    user.username.toLowerCase().includes(this.searchUserQuery.toLowerCase())
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
      alert(error.error || "Något gick fel, försök igen.");
    }
  );
}


deleteUser(user: any) {
  this.userService.deleteUser(user.userId).subscribe(
    (response) => {
      this.users = this.users.filter((u) => u.userId !== user.userId);
      alert("Användaren har tagits bort!");
    },
    (error) => {
      alert("Något gick fel vid borttagning av användare.");
    }
    
  );
}

deleteAdmin(admin: any) {

  this.adminService.deleteAdmin(admin.adminID).subscribe(
    (response) => {
      this.admins = this.admins.filter((admin) => admin.adminID !== admin.adminID);
      alert("Användaren har tagits bort!");
    },
    (error) => {
      alert("Något gick fel vid borttagning av admin.");
    }
    
  );
}

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
