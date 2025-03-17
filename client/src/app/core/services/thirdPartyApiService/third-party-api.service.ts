import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root'
})
export class ThirdPartyApiService {
  private readonly api: string;
  
  constructor(private http: HttpClient, private apiService: ApiService) {
    this.api = this.apiService.api;
   }

   public async getUserImage(): Promise<any> {
    try {
      const userImage = await this.http.get(`${this.api}/proxy/user-image`).toPromise();
      return userImage;
    } catch (error) {
      console.error('Error fetching user image', error);
      throw error;
    }
  }

  public async getTeamImage(): Promise<any> {
    try {
      const teamImage = await this.http.get(`${this.api}/proxy/team-image`).toPromise();
      return teamImage;
    } catch (error) {
      console.error('Error fetching team image', error);
      throw error;
    }
  }

  public async getScoreboardImage(): Promise<any> {
    try {
      const scoreboardImage = await this.http.get(`${this.api}/proxy/scoreboard-image`).toPromise();
      return scoreboardImage;
    } catch (error) {
      console.error('Error fetching scoreboard image', error);
      throw error;
    }
  }
  
}
