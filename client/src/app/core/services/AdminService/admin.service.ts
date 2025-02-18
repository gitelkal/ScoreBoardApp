import { Injectable } from '@angular/core';
import { Admins } from '../../../shared/models/admins.model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private readonly api: string;

  constructor(private http: HttpClient, private apiService: ApiService) {
    this.api = this.apiService.api;
  }

  public getAllAdmins(): Observable<Admins[]> {
    return this.http.get<Admins[]>(`${this.api}/admins`);
  }

  public getOneAdmin(id: string): Observable<Admins> {
    return this.http.get<Admins>(`${this.api}/admins/${id}`);
  }

  // 🟢 Ny funktion: Skapa tävling
  public createCompetition(competition: { name: string; startedAt: string }): Observable<any> {
    return this.http.post(`${this.api}/scoreboards?name=${competition.name}&startedAt=${competition.startedAt}`, {});
  }
}

