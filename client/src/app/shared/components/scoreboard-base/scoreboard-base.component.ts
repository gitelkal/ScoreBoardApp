import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ScoreboardService } from '@app/core/services/scoreboardService/scoreboard.service';
import { SignalRService } from '@app/core/services/signalRService/signal-r.service';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { switchMap, debounceTime } from 'rxjs/operators';
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
  isBarChartView: boolean = false;

  protected pointsChangeSubject = new Subject<{ teamID: number; points: number }>();
  protected scoreboardResponseSubject = new BehaviorSubject<ScoreboardResponse | null>(null);
  getRichScoreboard$ = this.scoreboardResponseSubject.asObservable();
  teamColorAssignments: Map<string, string> = new Map();

  ngOnInit() {
    this.signalRService.startConnection();
    this.isBarChartView = false;
    this.loadInitialScoreboard();
    this.subscribeToScoreUpdates();
    this.pointsChangeSubject.pipe(debounceTime(200)).subscribe(({ teamID, points }) => {
      this.setPoints(teamID, points);
    });
  }

  protected loadInitialScoreboard() {
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

  protected loadUserTeams() {
    if (!this.userID) return;
    this.userService.getUserTeams(this.userID).subscribe(response => {
      this.userTeams = response;
    });

    this.scoreboardTeamsService.getUserTeamsNotInScoreboard(Number(this.scoreboardID), this.userID)
      .subscribe(response => this.userTeamsNotInScoreboard = response);
  }

  protected subscribeToScoreUpdates() {
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

  getBarHeight(points: number): number {
    const maxPoints = Math.max(...(this.scoreboardResponseSubject.value?.scoreboard.teams.map(team => team.points) || [1])) || 1;
    return (points / maxPoints) * 300;
  }

  getTeamColor(teamName: string, existingAssignments: Map<string, string>): string {
    const colors = [
        'linear-gradient(to top, #b30000, #ff4d4d)', // Röd
        'linear-gradient(to top, #ffcc00, #ffea00)', // Gul
        'linear-gradient(to top, #ff6600, #ff9933)', // Orange
        'linear-gradient(to top, #b30086, #ff00ff)', // Rosa/Lila
        'linear-gradient(to top, #0080ff, #00cfff)', // Blå
        'linear-gradient(to top, #008000, #00ff00)', // Grön
        'linear-gradient(to top, #ff1493, #ff69b4)', // Mörkrosa
        'linear-gradient(to top, #4b0082, #8a2be2)', // Indigo/Lila
        'linear-gradient(to top, #ff4500, #ff8c00)', // Röd-orange
        'linear-gradient(to top, #4682b4, #87ceeb)'  // Stålblå
    ];
    if (existingAssignments.has(teamName)) {
        return existingAssignments.get(teamName)!;
    }
    let assignedColor: string;
    if (existingAssignments.size < colors.length) {
        assignedColor = colors[existingAssignments.size];
    } else {
        assignedColor = this.generateRandomGradient();
    }
    existingAssignments.set(teamName, assignedColor);
    return assignedColor;
}

generateRandomGradient(): string {
    const randomColor = () => Math.floor(Math.random() * 16777215).toString(16);
    return `linear-gradient(to top, #${randomColor()}, #${randomColor()})`;
}

  onPointsChange(teamID: number, points: any) {
    this.pointsChangeSubject.next({ teamID, points: points });
  }
}


