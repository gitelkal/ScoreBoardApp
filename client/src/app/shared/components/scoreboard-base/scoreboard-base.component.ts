import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ScoreboardService } from '@app/core/services/scoreboardService/scoreboard.service';
import { SignalRService } from '@app/core/services/signalRService/signal-r.service';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { ScoreboardResponse } from '@app/shared/models/richScoreboard.model';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '@app/core/services/auth/auth.service';
import { TeamUsersService } from '@app/core/services/teamUsersService/team-users.service';
import { ScoreboardTeamsService } from '@app/core/services/scoreboardTeamsService/scoreboard-teams.service';
import { UserService } from '@app/core/services/userService/user.service';
import { Teams } from '@app/shared/models/teams.models';
import { RegisterComponent } from '../register/register.component';
import { PopUpComponent } from '../pop-up/pop-up.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';

@Component({
  template: ''
})

  export abstract class ScoreboardBaseComponent implements OnInit {
  protected readonly dialog = inject(MatDialog);
  protected readonly scoreboardService = inject(ScoreboardService);
  protected readonly route = inject(ActivatedRoute);
  protected readonly authService = inject(AuthService);
  protected readonly teamUserService = inject(TeamUsersService);
  protected readonly scoreboardTeamsService = inject(ScoreboardTeamsService);
  protected readonly userService = inject(UserService);
  protected readonly signalRService = inject(SignalRService);
  protected readonly snackBar = inject(MatSnackBar);  
  
  isAddingTeam = false;
  isJoiningTeam = false;
  newTeamName = '';
  isTeamDropdownOpen = false;
  openTeamIndex: number | null = null;

  isAdmin!: Observable<boolean>;
  loggedIn!: Observable<boolean>;
  userID: number = 0;
  userTeams: Teams[] = [];
  userTeamsNotInScoreboard: Teams[] = [];
  scoreboardID: string | null = "0";

  protected pointsChangeSubject = new Subject<{ scoreboardID: number,teamID: number; points: number }>();
  protected scoreboardResponseSubject = new BehaviorSubject<ScoreboardResponse | null>(null);
  protected destroy$ = new Subject<void>();

  getRichScoreboard$ = this.scoreboardResponseSubject.asObservable();
  
  ngOnInit() {
    this.signalRService.startConnection();
    this.scoreboardID = this.route.snapshot.paramMap.get('id');
    this.loadInitialScoreboard();
    this.subscribeToScoreUpdates();
    this.subscribeToPointsChanges();
  }

  protected loadInitialScoreboard() {
    if (!this.scoreboardID) return;
    this.scoreboardService.getRichScoreboard(this.scoreboardID).then(response => {
      this.scoreboardResponseSubject.next(response);
    }).catch(error => {
      console.error('Error loading initial scoreboard:', error);
    });
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

  protected loadUserTeams() {
    if (!this.userID) return;
    this.userService.getUserTeams(this.userID).then(response => {
      this.userTeams = response;
    });
    this.scoreboardTeamsService.getUserTeamsNotInScoreboard(Number(this.scoreboardID), this.userID)
      .then(response => this.userTeamsNotInScoreboard = response);
  }

  protected subscribeToScoreUpdates() {
    this.signalRService.scoreUpdates.subscribe(update => {
      if (!update) return;
      const currentScoreboard = this.scoreboardResponseSubject.value;
      if (!currentScoreboard?.scoreboard?.teams || update.scoreboardId !== Number(this.scoreboardID)) return;
      const teamToUpdate = currentScoreboard.scoreboard.teams.find(team => team.teamID === update.teamId);
      if (teamToUpdate) {
        const targetScore = update.points;
        const currentScore = teamToUpdate.points;
        if (currentScore !== targetScore) {
          this.animateScoreChange(currentScore, targetScore, 2000, teamToUpdate, currentScoreboard);
        } else {
          teamToUpdate.points = targetScore;
          currentScoreboard.scoreboard.teams.sort((a, b) => b.points - a.points);
          this.scoreboardResponseSubject.next(currentScoreboard);
        }
      }
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

  removeTeam(teamId: number) {
    this.scoreboardTeamsService.removeTeamFromScoreboard(Number(this.scoreboardID), teamId).subscribe(() => {
      const currentScoreboard = this.scoreboardResponseSubject.value;
      if (!currentScoreboard?.scoreboard?.teams) return;
      currentScoreboard.scoreboard.teams = currentScoreboard.scoreboard.teams.filter(team => team.teamID !== teamId);
      this.scoreboardResponseSubject.next({ ...currentScoreboard });
      this.snackBar.open('Tog bort lag', 'Stäng', { duration: 2000 });
    });
  }

  async toggleRegisterModal(teamId: number) {
    this.dialog.open(RegisterComponent).afterClosed().subscribe(() => {
      this.snackBar.open('Registrerade ny användare', 'Stäng', { duration: 2000 });
      this.loadInitialScoreboard();
      firstValueFrom(this.loggedIn).then(isLoggedIn => {
        if (isLoggedIn) {
          this.teamUserService.joinTeam(this.userID,teamId).subscribe(() => {
            this.loadInitialScoreboard();
            this.snackBar.open('Gick med i lag', 'Stäng', { duration: 2000 });
          });
        } else {
          this.snackBar.open('Kunde inte ej gå med i lag, försök igen', 'Stäng', { duration: 2000 });
        }
      });
    });
  }

  joinTeam(teamId: number) {
    if (!this.userID) return;
    this.teamUserService.joinTeam(this.userID, teamId).subscribe(() => {
      this.loadInitialScoreboard();
      this.snackBar.open('Gick med i lag', 'Stäng', { duration: 2000 });
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
      .subscribe();
      this.snackBar.open('Uppdaterade poäng', 'Stäng', { duration: 2000 });
  }

  protected subscribeToPointsChanges() {
    this.pointsChangeSubject.pipe(debounceTime(200), takeUntil(this.destroy$))
    .subscribe(({ scoreboardID, teamID, points }) => {
        if (scoreboardID === Number(this.scoreboardID)) {
            this.setPoints(teamID, points);
        }
    });
  }

  onPointsChange(teamID: number, points: any) {
    this.pointsChangeSubject.next({scoreboardID: Number(this.scoreboardID), teamID, points: points });
  }

  private animateScoreChange(start: number, end: number, maxDuration: number, teamToUpdate: any, currentScoreboard: any) {
    let current = start;
    const step = start < end ? 1 : -1;
    const interval = 50;
    const steps = maxDuration / interval; 
    const stepIncrement = (end - start) / steps;
    let elapsed = 0;
    const animationInterval = setInterval(() => {
      elapsed += interval;
      current += stepIncrement;
      teamToUpdate.points = Math.round(current); 
      currentScoreboard.scoreboard.teams.sort((a: any, b: any) => b.points - a.points);
      this.scoreboardResponseSubject.next(currentScoreboard);
      if (Math.round(current) === end || elapsed >= maxDuration) {
        clearInterval(animationInterval);
        teamToUpdate.points = end;
        currentScoreboard.scoreboard.teams.sort((a: any, b: any) => b.points - a.points);
        this.scoreboardResponseSubject.next(currentScoreboard);
      }
    }, interval);
  }
}


