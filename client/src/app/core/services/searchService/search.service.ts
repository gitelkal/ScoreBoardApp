import { Injectable } from '@angular/core';
import { ApiService } from '../api/api.service';
import { catchError, map, Observable, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private readonly api: string;

  constructor(private apiService: ApiService, private http: HttpClient) {
    this.api = this.apiService.api;
  }

  public async submit(query: string): Promise<any> {
    try {
      const response = await this.http.get(`${this.api}/search?query=${query}`).toPromise();
      return response;
    } catch (error) {
      console.error('Error submitting query', error);
      throw error;
    }
  }

  public async getAllTeamsUsersScoreboards(): Promise<any> {
    try {
      const response = await this.http.get(`${this.api}/search/all`).toPromise();
      return response;
    } catch (error) {
      console.error('Error fetching all teams, users, and scoreboards', error);
      throw error;
    }
  }
}
