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


}
