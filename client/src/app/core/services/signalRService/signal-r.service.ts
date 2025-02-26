import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection!: signalR.HubConnection;
  public scoreUpdates = new BehaviorSubject<{scoreboardId: number; teamId: number; points: number } | null>(null);

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
  }
}
