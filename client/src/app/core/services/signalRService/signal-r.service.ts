import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection!: signalR.HubConnection;
  public scoreUpdates = new BehaviorSubject<{scoreboardId: number; teamId: number; points: number } | null>(null);
  public taskCountUpdates = new BehaviorSubject<{scoreboardId: number; taskCount: number} | null>(null);
  public taskPointsUpdates = new BehaviorSubject<{scoreboardId: number; pointsPerTask: number} | null>(null);
  public taskCompletionUpdates = new BehaviorSubject<{scoreboardId: number; teamId: number; points: number} | null>(null);
  public userJoinTeamUpdates = new BehaviorSubject<{teamId: number; userId: number } | null>(null);
  public userLeftTeamUpdates = new BehaviorSubject<{teamId: number; userId: number } | null>(null);
  public scoreboardCreation = new BehaviorSubject<number | null>(null);
  public teamJoinedScoreboard = new BehaviorSubject<{teamId: number; scoreboardId: number} | null>(null);

  constructor() { }

  public startConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7062/scoreboardHub', {
        withCredentials: true
      }).build();

    this.hubConnection
      .start()
      .then(() => console.log('SignalR Connected'))
      .catch(err => console.log('Error while starting SignalR: ' + err));

    this.hubConnection.on('ReceiveScoreUpdate', (scoreboardId: number,teamId: number, points: number) => {
      console.log(`Update received: Team ${teamId} now has ${points} points in scorebard ${scoreboardId}`);
      this.scoreUpdates.next({ scoreboardId, teamId, points });
    });

    this.hubConnection.on('ReceiveUserJoinedTeam', (teamId: number, userId: number) => {
      console.log(`User ${userId} joined team ${teamId}`);
      this.userJoinTeamUpdates.next({ teamId, userId });
    });

    this.hubConnection.on('ReceiveUserLeftTeam', (teamId: number, userId: number) => {
      console.log(`User ${userId} left team ${teamId}`);
      this.userLeftTeamUpdates.next({ teamId, userId });
    });

    this.hubConnection.on('ReceiveScoreboardCreation', (scoreboardId: number) => {
      console.log(`Scoreboard ${scoreboardId} was created`);
      this.scoreboardCreation.next(scoreboardId);
    });
    this.hubConnection.on('TeamJoinedScoreboard', (scoreboardId: number, teamId: number) => {
      console.log(`Team ${teamId} joined scoreboard ${scoreboardId}`);
      this.teamJoinedScoreboard.next({ scoreboardId, teamId });
    });
    this.hubConnection.on('TaskCountUpdated', (scoreboardId: number, taskCount: number) => {
      console.log(`Scoreboard ${scoreboardId} has ${taskCount} tasks.`);
      this.taskCountUpdates.next({ scoreboardId, taskCount });
    });
    this.hubConnection.on('TaskPointsUpdated', (scoreboardId: number, pointsPerTask: number) => {
      console.log(`Scoreboard ${scoreboardId} gives ${pointsPerTask} points/task.`);
      this.taskPointsUpdates.next({ scoreboardId, pointsPerTask });
    });
    this.hubConnection.on('TaskCompleted', (scoreboardId: number, teamId: number, points: number) => {
      console.log(`Task done. Team ${teamId} got ${points} points in scoreboard ${scoreboardId}.`);
      this.taskCompletionUpdates.next({ scoreboardId, teamId, points });
    });
  }
}
