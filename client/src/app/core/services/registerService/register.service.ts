import { Injectable } from '@angular/core';
import { RegisterRequest } from '@app/interfaces/register-request';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../api/api.service';
import { map, Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  private readonly api: string;

  constructor(private http: HttpClient, private apiService: ApiService, private authService: AuthService) {
    this.api = this.apiService.api;
  }
  createNewUser(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.api}/register`, data).pipe(
      map((response: any) => {
        this.authService.login({ username: data.username, password: data.password }).subscribe();
        return response;
      })
    );
  }
}
