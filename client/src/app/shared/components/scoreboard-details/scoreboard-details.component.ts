import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ScoreboardService } from '@app/core/services/scoreboardService/scoreboard.service';
import { SignalRService } from '@app/core/services/signalRService/signal-r.service';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ScoreboardResponse } from '@app/shared/models/richScoreboard.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RegisterComponent } from '../register/register.component';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '@app/core/services/auth/auth.service';
import { TeamUsersService } from '@app/core/services/teamUsersService/team-users.service';
import { ScoreboardTeamsService } from '@app/core/services/scoreboardTeamsService/scoreboard-teams.service';
import { UserService } from '@app/core/services/userService/user.service';
import { Teams } from '@app/shared/models/teams.models';
import { PopUpComponent } from '../pop-up/pop-up.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-scoreboard-details',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './scoreboard-details.component.html',
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly teamUserService = inject(TeamUsersService);
  private readonly scoreboardTeamsService = inject(ScoreboardTeamsService);
  private readonly userService = inject(UserService);
  private readonly signalRService = inject(SignalRService);
  private readonly snackBar = inject(MatSnackBar);

  isAddingTeam = false; 
  newTeamName = '';
  openTeamIndex: number | null = null;
  isAdmin!: Observable<boolean>;
  loggedIn!: Observable<boolean>;
  userID: number = 0;
  userTeams: Teams[] = [];
  userTeamsNotInScoreboard: Teams[] = [];
  scoreboardID: string | null = "0";
  isTeamDropdownOpen = false; 
  isJoiningTeam = false;
  private scoreboardResponseSubject = new BehaviorSubject<ScoreboardResponse | null>(null);
  getRichScoreboard$ = this.scoreboardResponseSubject.asObservable();

  ngOnInit() {
    this.signalRService.startConnection();
    this.subscribeToScoreUpdates();
    this.loadInitialScoreboard();
  }

  private loadInitialScoreboard() {
    this.scoreboardID = this.route.snapshot.paramMap.get('id');
    if (!this.scoreboardID) return;

    this.scoreboardService.getRichScoreboard(this.scoreboardID).subscribe(response => {
      this.scoreboardResponseSubject.next(response);
    });

    this.authService.tokenExpirationCheck();
    this.isAdmin = this.authService.isAdmin;
    this.loggedIn = this.authService.loggedIn;
    this.userID = this.authService.getUserID() ?? 0;

    this.loadUserTeams();
  }

  openPopup(color: string, text: string) {
    this.dialog.open(PopUpComponent, {
      data: { color, text },
      position: { bottom: '20px', right: '20px' }, 
      panelClass: 'popup-dialog'
    });
    
    setTimeout(() => {
      this.dialog.closeAll();
    }, 3000); 
  }

  private loadUserTeams() {
    if (!this.userID) return;
    this.userService.getUserTeams(this.userID).subscribe(response => {
      this.userTeams = response;
    });

    this.scoreboardTeamsService.getUserTeamsNotInScoreboard(Number(this.scoreboardID), this.userID)
      .subscribe(response => this.userTeamsNotInScoreboard = response);
  }

  private subscribeToScoreUpdates() {
    this.signalRService.scoreUpdates.subscribe(update => {
      if (!update) return;
      const currentScoreboard = this.scoreboardResponseSubject.value;
      if (!currentScoreboard?.scoreboard?.teams) return;

      currentScoreboard.scoreboard.teams = currentScoreboard.scoreboard.teams
        .map(team => team.teamID === update.teamId ? { ...team, points: update.points } : team)
        .sort((a, b) => b.points - a.points);

      this.scoreboardResponseSubject.next({ ...currentScoreboard });
    });
  }

  appendTeam(teamId: number) {
    if (!this.scoreboardID) return;
    this.scoreboardTeamsService.addTeamToScoreboard(Number(this.scoreboardID), teamId)
      .subscribe(() => this.loadInitialScoreboard());
    this.snackBar.open('Lade till lag', 'Stäng', { duration: 2000 });
  }

  addTeam(event: Event) {
    event.preventDefault();
    if (!this.newTeamName.trim() || !this.scoreboardID) return;
    
    this.scoreboardService.CreateAndAddEmptyTeamToScoreboard(this.scoreboardID, this.newTeamName)
      .subscribe(() => {
        this.isAddingTeam = false;
        this.newTeamName = '';
        this.loadInitialScoreboard();
      });
  }

  removeTeam(teamId: number)
  {
    this.scoreboardTeamsService.removeTeamFromScoreboard(Number(this.scoreboardID),teamId).subscribe(() => {
      this.loadInitialScoreboard();
      this.snackBar.open('Tog bort lag', 'Stäng', { duration: 2000 });
    });
  }

  toggleRegisterModal(teamId: number) {
    this.dialog.open(RegisterComponent).afterClosed().subscribe(() => {
      this.snackBar.open('Registrerade ny användare', 'Stäng', { duration: 2000 });
      this.loadInitialScoreboard();
      this.teamUserService.joinTeam(this.userID,teamId).subscribe(() => {
        this.snackBar.open('Gick med i lag', 'Stäng', { duration: 2000 });
      });
    });
  }

  joinTeam(teamId: number) {
    if (!this.userID) return;
    this.teamUserService.joinTeam(this.userID, teamId).subscribe(() => {
      this.loadInitialScoreboard();
      this.snackBar.open('Gick med i lag', 'Stäng', { duration: 222000 });
      
    });
  }

  toggleDropdown(index: number) {
    this.openTeamIndex = this.openTeamIndex === index ? null : index;
  }

  toggleTeamDropdown() {
    this.isTeamDropdownOpen = !this.isTeamDropdownOpen;
    this.isJoiningTeam = !this.isJoiningTeam;
  }

  isUserInTeam(teamID: number): boolean {
    return this.userTeams.some(team => team.teamID === teamID);
  }

  setPoints(teamId: number, points: number) {
    if (!this.scoreboardID) return;
    this.scoreboardTeamsService.setScoreboardTeamPoints(this.scoreboardID, teamId, points)
      .subscribe(() => this.loadInitialScoreboard());
      this.snackBar.open('Uppdaterade poäng', 'Stäng', { duration: 2000 });
  }
}
