import { Injectable } from '@angular/core';
import { Admins } from '../../../shared/models/admins.model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../api/api.service';
import { AdminCheckRequest } from '@app/interfaces/admin-check-request';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly api: string;

  constructor(private http: HttpClient, private apiService: ApiService) {
    this.api = this.apiService.api;
  }

  public async getAllAdmins(): Promise<Admins[]> {
    try {
      const admins = await this.http.get<Admins[]>(`${this.api}/admins`).toPromise();
      return admins || [];
    } catch (error) {
      console.error('Error fetching all admins', error);
      throw error;
    }
  }

  public async getOneAdmin(id: string): Promise<Admins> {
    try {
      const admin = await this.http.get<Admins>(`${this.api}/admins/${id}`).toPromise();
      if (!admin) {
        throw new Error(`Admin with id ${id} not found`);
      }
      return admin;
    } catch (error) {
      console.error(`Error fetching admin with id ${id}`, error);
      throw error;
    }
  }

  public createCompetition(competition: {
    name: string;
    startedAt: string;
  }): Observable<any> {
    return this.http.post(
      `${this.api}/scoreboards?name=${competition.name}&startedAt=${competition.startedAt}`,
      {}
    );
  }

  public checkIfAdmin(
    data: AdminCheckRequest
  ): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(
      `${this.api}/admins/check`,
      data
    );
  }



  public makeAdmin(payload: { username: string }): Observable<any> {
    return this.http.post(`${this.api}/admins`, payload);
  }
  public deleteAdmin(id: string): Observable<any> {
    return this.http.delete(`${this.api}/admins/${id}`);
  }
}
