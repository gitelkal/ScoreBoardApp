import { Component, inject, OnInit } from '@angular/core';
import { ScoreboardService } from '@app/core/services/scoreboardService/scoreboard.service';
import { SignalRService } from '@app/core/services/signalRService/signal-r.service';
import { ScoreboardResponse } from '@app/shared/models/richScoreboard.model';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { DatePipe, NgFor, CommonModule, AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@app/core/services/auth/auth.service';
import { ScoreboardTeamsService } from '@app/core/services/scoreboardTeamsService/scoreboard-teams.service';
import { TeamUsersService } from '@app/core/services/teamUsersService/team-users.service';
import { UserService } from '@app/core/services/userService/user.service';
import { Teams } from '@app/shared/models/teams.models';

@Component({
  selector: 'app-scoreboard-dark',
  imports: [DatePipe, NgFor, CommonModule, FormsModule, AsyncPipe, RouterLink],
  templateUrl: './scoreboard-dark.component.html',
  styleUrl: './scoreboard-dark.component.css'
})
export class ScoreboardDarkComponent implements OnInit {
  scoreboardTeamsService = inject(ScoreboardTeamsService);
  scoreboardService = inject(ScoreboardService);
  teamUsersService = inject(TeamUsersService);
  userService = inject(UserService);
  signalR = inject(SignalRService);
  route = inject(ActivatedRoute);
  auth = inject(AuthService);

  userID: number = this.auth.getUserID() ?? 0;
  loggedIn = this.auth.loggedIn;
  isAdmin= this.auth.isAdmin;
  isPointsDropdownOpen: boolean = false;
  isJoinDropdownOpen: boolean = false;
  noConflict: boolean = true;
  selectedJoinTeamId: number = 0;
  scoreboardID: number = 0;
  activeScoreboard: boolean = false;
  selectedTeamId: number | undefined;
  pointsToGive: number | undefined;
  scoreboards: ScoreboardResponse[] = [];
  myTeams: Teams[] = [];
  availableTeams: Teams[] = [];
  isViewDropdownOpen = false;

  toggleViewDropdown() {
    this.isViewDropdownOpen = !this.isViewDropdownOpen;
  }

  private routeSubscription: Subscription | undefined;
  private pointsSubscription: Subscription | undefined;
  private teamParticipationSubscription: Subscription | undefined;

  ngOnInit(): void {
      this.loadScoreboard();
      this.signalR.startConnection();
      this.subscribeToScoreUpdates();
      this.subscribeToNewTeams();
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    this.pointsSubscription?.unsubscribe();
    this.teamParticipationSubscription?.unsubscribe();
  }

  loadScoreboard(): void {
    this.routeSubscription = this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.scoreboardID = Number(id);
      this.scoreboardService.getRichScoreboard(id!).then((scoreboard: ScoreboardResponse) => {
        const exists = this.scoreboards.some(sb => sb.scoreboard.scoreboardId === scoreboard.scoreboard.scoreboardId);
        if (!exists) {
          this.scoreboards.push(scoreboard);
          if(scoreboard.scoreboard.active){
            this.activeScoreboard = true;
          }
        }
      }).catch(error => {
        console.error('Error loading scoreboard:', error);
      });
    });
    this.updateAvailableTeams();
    this.userService.getUserTeams(this.userID).then((teams) => {
      this.myTeams = teams;
      this.updateAvailableTeams();
    }).catch(error => {
      console.error('Error fetching user teams:', error);
    });
  }

  subscribeToScoreUpdates(): void {
    this.pointsSubscription = this.signalR.scoreUpdates.subscribe((update) => {
      if (update) {
        const { teamId, points } = update;
        const scoreboard = this.scoreboards.find(sb => sb.scoreboard.scoreboardId === this.scoreboardID);
        if (scoreboard) {
          const team = scoreboard.scoreboard.teams.find(team => team.teamID === teamId);
          if (team) {
            team.points = points;
            const teamIDelement = document.querySelector(`#team-points-${teamId}`);
            if (teamIDelement) {
              teamIDelement.classList.add('points');
              setTimeout(() => {
                teamIDelement.classList.remove('points');
              }, 10000); 
            }
          } else {
            console.log(`Team ${teamId} not found in scoreboard ${this.scoreboardID}`);
          }
        } else {
          console.log(`Scoreboard ${this.scoreboardID} not found`);
        }
      }
    });
  }

  subscribeToNewTeams(): void {
    this.teamParticipationSubscription = this.signalR.teamJoinedScoreboard.subscribe((update) => {
      if (update) {
        const { teamId, scoreboardId } = update;
        if (scoreboardId === this.scoreboardID) {
          const scoreboard = this.scoreboards.find(sb => sb.scoreboard.scoreboardId === this.scoreboardID);
          if (scoreboard) {
              this.scoreboardService.getRichScoreboard(scoreboardId.toString()).then((updatedScoreboard: ScoreboardResponse) => {
                const newTeam = updatedScoreboard.scoreboard.teams.find(team => team.teamID === teamId);
                if (newTeam) {
                  scoreboard.scoreboard.teams.push(newTeam);
                }
              });
          }
        }
      }
    });
    this.updateAvailableTeams();
  }

  updateAvailableTeams(): void {
    this.scoreboardTeamsService.getUserTeamsNotInScoreboard(this.scoreboardID, this.userID).then((teams) => {
      this.availableTeams = teams;
      const scoreboard = this.scoreboards.find(sb => sb.scoreboard.scoreboardId === this.scoreboardID);
      if (scoreboard) {
        this.noConflict = !this.myTeams.some(myTeam =>
          scoreboard.scoreboard.teams.some(sbTeam => sbTeam.teamID === myTeam.teamID)
        );
      } else {
        this.noConflict = false;
      }
    });
  }

  givePoints(teamID: number, points: number): void {
    this.pointsSubscription = this.scoreboardTeamsService.givePointsToTeam(this.scoreboardID, teamID, points).subscribe();
  }

  submitPoints(): void {
    if (this.selectedTeamId !== undefined && this.pointsToGive !== undefined) {
      this.givePoints(this.selectedTeamId, this.pointsToGive);
    }
  }

  participate(teamID: number, scoreboardID: number): void {
    if (teamID !== undefined && scoreboardID !== undefined) {
      this.scoreboardTeamsService.addTeamToScoreboard(scoreboardID, teamID).subscribe(() => {
        this.closeJoinDropdown();
        this.updateAvailableTeams(); 
      });
    }
  }

  get teams() {
    const scoreboard = this.scoreboards.find(sb => sb.scoreboard.scoreboardId === this.scoreboardID);
    return scoreboard ? scoreboard.scoreboard.teams : [];
  }

  get sortedTeams() {
    const scoreboard = this.scoreboards.find(sb => sb.scoreboard.scoreboardId === this.scoreboardID);
    if (scoreboard) {
      return scoreboard.scoreboard.teams.sort((a, b) => b.points - a.points);
    }
    return [];
  }

  togglePointsDropdown(): void {
    this.isPointsDropdownOpen = !this.isPointsDropdownOpen;
    this.isJoinDropdownOpen = false;
  }

  closePointsDropdown(): void {
    this.isPointsDropdownOpen = false;
  }

  toggleJoinDropdown(): void {
    this.isJoinDropdownOpen = !this.isJoinDropdownOpen;
    this.isPointsDropdownOpen = false;
  }
  
  closeJoinDropdown(): void {
    this.isJoinDropdownOpen = false;
  }
}
