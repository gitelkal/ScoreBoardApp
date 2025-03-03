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

  getUserImage() {
    return this.http.get(`${this.api}/proxy/user-image`);
  }
  
  getTeamImage() {
    return this.http.get(`${this.api}/proxy/team-image`);
  }
  
  getScoreboardImage() {
    return this.http.get(`${this.api}/proxy/scoreboard-image`);
  }
  
}
