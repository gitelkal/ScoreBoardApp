import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ScoreboardService } from '@app/core/services/scoreboardService/scoreboard.service';
import { SignalRService } from '@app/core/services/signalRService/signal-r.service';
import { Observable, BehaviorSubject, Subject, Subscription } from 'rxjs';
import { AsyncPipe, NgIf } from '@angular/common';
import { CommonModule } from '@angular/common';
import { switchMap, debounceTime } from 'rxjs/operators';
import { ScoreboardResponse } from '@app/shared/models/richScoreboard.model';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '@app/core/services/auth/auth.service';
import { TeamUsersService } from '@app/core/services/teamUsersService/team-users.service';
import { ScoreboardTeamsService } from '@app/core/services/scoreboardTeamsService/scoreboard-teams.service';
import { UserService } from '@app/core/services/userService/user.service';
import { Teams } from '@app/shared/models/teams.models';

@Component({
  template: ''
})

  export abstract class ScoreboardBaseComponent implements OnInit {
  readonly dialog = inject(MatDialog);
  isAddingTeam = false;
  newTeamName = '';
  scoreboardService = inject(ScoreboardService);
  route = inject(ActivatedRoute);
  openTeamIndex: number | null = null;
  isAdmin!: Observable<boolean>;
  loggedIn!: Observable<boolean>;
  userID: number = 0;
  usersInTeam = []
  isTeamDropdownOpen = false;
  isJoiningTeam = false;
  userTeams: Teams[] = [];
  userTeamsNotInScoreboard: Teams[] = [];
  teamsSubscription: Subscription | undefined;
  userTeamSubscription: Subscription | undefined;
  scoreboardID: string| null = "0";
  isBarChartView: boolean = false;

  private pointsChangeSubject = new Subject<{ teamID: number; points: number }>();
  private scoreboardResonseSubject = new BehaviorSubject<ScoreboardResponse | null>(null);
  getRichScoreboard$ = this.scoreboardResonseSubject.asObservable();
  teamColorAssignments: Map<string, string> = new Map();

  constructor(protected signalRService: SignalRService, protected authService: AuthService, protected teamUserService: TeamUsersService, protected scoreboardTeamsService: ScoreboardTeamsService, protected userService: UserService) {}

  ngOnInit() {
    this.signalRService.startConnection();
    this.isBarChartView = false;
    this.loadInitialScoreboard();
    this.subscribeToScoreUpdates();
    this.pointsChangeSubject.pipe(debounceTime(200)).subscribe(({ teamID, points }) => {
      this.setPoints(teamID, points);
    });
  }

  loadInitialScoreboard() {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        this.scoreboardID = id; 
        return this.scoreboardService.getRichScoreboard(id!);
      })
    ).subscribe(ScoreboardResponse => {
      this.scoreboardResonseSubject.next(ScoreboardResponse); 
    });

    this.authService.tokenExpirationCheck();
    this.isAdmin = this.authService.isAdmin;
    this.loggedIn = this.authService.loggedIn;
    this.userID = this.authService.getUserID() ?? 0;

    console.log('logged in: ',this.loggedIn)
    console.log('admin: ',this.isAdmin)
    console.log('userid: ',this.userID)

    this.teamsSubscription = this.userService.getUserTeams(this.userID).subscribe({
      next: (response) => {
        this.userTeams = response;
        console.log(this.userTeams)
      }
    });

    this.userTeamSubscription = this.scoreboardTeamsService.getUserTeamsNotInScoreboard(Number(this.scoreboardID ?? "0"),this.userID).subscribe({
      next: (response) => {
        this.userTeamsNotInScoreboard = response;
        console.log(this.userTeamsNotInScoreboard)
      }, error: (error) => {
        console.log('Error getting teams:', error);
      }
    });
  }

  subscribeToScoreUpdates() {
    this.signalRService.scoreUpdates.subscribe(update => {
      if (update) {
        const currentScoreboard = this.scoreboardResonseSubject.value;
        if (currentScoreboard?.scoreboard?.teams) {  
          const updatedTeams = currentScoreboard.scoreboard.teams.map(team => 
            team.teamID === update.teamId ? { ...team, points: update.points } : team
          );

          const sortedTeams = updatedTeams.sort((a, b) => b.points - a.points);
  
          this.scoreboardResonseSubject.next({
            ...currentScoreboard,
            scoreboard: {
              ...currentScoreboard.scoreboard,
              teams: sortedTeams
            }
            
          });
        }
      }
    });
  } 
  
  appendTeam(teamId: number)
  {
    console.log(teamId)
    console.log(Number(this.scoreboardID ?? "0"))
    console.log(this.scoreboardTeamsService.addTeamToScoreboard(Number(this.scoreboardID ?? "0"),teamId))


    this.route.paramMap.pipe(
      switchMap(params => {
        const scoreboardId = params.get('id'); 
        if (!scoreboardId) {
          console.error("Scoreboard ID is missing");
          return [];
        }
        return this.scoreboardTeamsService.addTeamToScoreboard(Number(this.scoreboardID ?? "0"),teamId)
      })
    ).subscribe({
      next: (response) => {
        console.log('added team:', response);
        this.loadInitialScoreboard(); 
      },
      error: (error) => {
        console.error('Error adding team:', error);
      }
    });
  }

  addTeam(event: Event) {
    event.preventDefault();
    if (!this.newTeamName.trim()) return;
    this.route.paramMap.pipe(
      switchMap(params => {
        const scoreboardId = params.get('id'); 
        if (!scoreboardId) {
          console.error("Scoreboard ID is missing");
          return [];
        }
        return this.scoreboardService.CreateAndAddEmptyTeamToScoreboard(scoreboardId, this.newTeamName);
      })
    ).subscribe({
      next: (response) => {
        console.log('Team added:', response);
        this.isAddingTeam = false;
        this.newTeamName = '';
        this.loadInitialScoreboard(); 
      },
      error: (error) => {
        console.error('Error adding team:', error);
      }
    });
  }
   
  toggleRegisterModal() {
      // this.dialog.open(RegisterTeamUserComponent);
    }
  joinTeam(teamId: number) {
    console.log('Tried to join team: ',teamId)
    console.log('with user id',this.userID)
    this.teamUserService.joinTeam(this.userID,teamId).subscribe({
      next: () => {
        this.loadInitialScoreboard();
      },
    });
  }

  toggleDropdown(index: number): void {
    this.openTeamIndex = this.openTeamIndex === index ? null : index;
  }

  toggleTeamDropdown(){
    this.isTeamDropdownOpen = !this.isTeamDropdownOpen
    this.isJoiningTeam = !this.isJoiningTeam
    console.log(this.isTeamDropdownOpen)
  }

  isUserInTeam(teamID: number): boolean {
    const team = this.userTeams.find(t => t.teamID === teamID);
    if (team)
    {
      return true;
    }
    else {
      return false;
    }
  }
 
  setPoints(teamid : number, points: number)
  {
      this.route.paramMap.pipe(
        switchMap(params => {
          const scoreboardId = params.get('id'); 
          if (!scoreboardId) {
            console.error("Scoreboard ID is missing");
            return [];
          }
          return this.scoreboardTeamsService.setScoreboardTeamPoints(scoreboardId,teamid,points);
        })
      ).subscribe({
        next: (response) => {
          console.log('points set:', response);
          this.loadInitialScoreboard(); 
        },
        error: (error) => {
          console.error('Error settings points:', error);
        }
      });
    } 

  getBarHeight(points: number): number {
    const maxPoints = Math.max(...(this.scoreboardResonseSubject.value?.scoreboard.teams.map(team => team.points) || [1])) || 1;
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


