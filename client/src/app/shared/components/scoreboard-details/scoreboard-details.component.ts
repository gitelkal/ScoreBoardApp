import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ScoreboardService } from '@app/core/services/scoreboardService/scoreboard.service';
import { SignalRService } from '@app/core/services/signalRService/signal-r.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { AsyncPipe, NgIf, NgFor } from '@angular/common';
import { CommonModule } from '@angular/common';
import { switchMap } from 'rxjs/operators';
import { ScoreboardResponse } from '@app/shared/models/richScoreboard.model';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RegisterComponent } from '../register/register.component';
// import {RegisterTeamUserComponent } from '../register-team-user/register-team-user.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AdminService } from '@app/core/services/adminService/admin.service';
import { AuthService } from '@app/core/services/auth/auth.service';
import { TeamUsersService } from '@app/core/services/teamUsersService/team-users.service';
import { ScoreboardTeamsService } from '@app/core/services/scoreboardTeamsService/scoreboard-teams.service';
import { UserService } from '@app/core/services/userService/user.service';
import { Subscription } from 'rxjs';
import { Teams } from '@app/shared/models/teams.models';
import { Subject, debounceTime } from 'rxjs';

@Component({
  selector: 'app-scoreboard-details',
  standalone: true,
  imports: [NgIf, AsyncPipe, CommonModule, FormsModule],
  templateUrl: './scoreboard-details.component.html',
  styleUrls: ['./scoreboard-details.component.css']
})

export class ScoreboardDetailsComponent implements OnInit {
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

  constructor(private signalRService: SignalRService, private authService: AuthService,private teamUserService: TeamUsersService, private scoreboardTeamsService : ScoreboardTeamsService, private userService : UserService) {}

  ngOnInit() {
    this.signalRService.startConnection();
    this.isBarChartView = false;
    this.loadInitialScoreboard();
    this.subscribeToScoreUpdates();
    this.pointsChangeSubject.pipe(debounceTime(500)).subscribe(({ teamID, points }) => {
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

  toggleView() {
    this.isBarChartView = !this.isBarChartView;
    this.subscribeToScoreUpdates();
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

  getTeamColor(index: number): string {
    const colors = [
      'linear-gradient(to top, #b30000, #ff4d4d)',
      'linear-gradient(to top, #ffcc00, #ffea00)',
      'linear-gradient(to top, #ff6600, #ff9933)',
      'linear-gradient(to top, #b30086, #ff00ff)',
      'linear-gradient(to top, #0080ff, #00cfff)',
    ];
    return colors[index % colors.length];
  }

  onPointsChange(teamID: number, points: any) {
    this.pointsChangeSubject.next({ teamID, points: points });
  }
}


