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

  submit(query: string): Observable<any> {
    return this.http.get(`${this.api}/search?query=${query}`).pipe(
      map((response: any) => {
        return response;
      }),
      catchError((error) => {
        return throwError(error);
      }))
  }
  getAllTeamsUsersScoreboards(): Observable<any> {
    return this.http.get(`${this.api}/search/all`).pipe(
      map((response: any) => {
        return response;
      }),
      catchError((error) => {
        return throwError(error);
      }))
  }
}
