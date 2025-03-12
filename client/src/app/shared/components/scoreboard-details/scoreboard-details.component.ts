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
  

  private scoreboardResonseSubject = new BehaviorSubject<ScoreboardResponse | null>(null);
  getRichScoreboard$ = this.scoreboardResonseSubject.asObservable();

  constructor(private signalRService: SignalRService, private authService: AuthService,private adminService: AdminService,private teamUserService: TeamUsersService, private scoreboardTeamsService : ScoreboardTeamsService) {}

  ngOnInit() {
    this.signalRService.startConnection();
    this.subscribeToScoreUpdates();
    this.loadInitialScoreboard();
  }

  loadInitialScoreboard() {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
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
        console.log("tried something")
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
}
