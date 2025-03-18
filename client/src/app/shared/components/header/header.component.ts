import { Component, ChangeDetectionStrategy, inject, HostListener, ElementRef, OnDestroy, Inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { LoginComponent } from '../login/login.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '@app/core/services/auth/auth.service';
import { NgIf, AsyncPipe, NgFor, DOCUMENT } from '@angular/common';
import { Observable, Subject } from 'rxjs';
import { RegisterComponent } from '../register/register.component';
import { FormsModule, NgForm } from '@angular/forms';
import { SearchService } from '@app/core/services/searchService/search.service';
import { Scoreboards } from '@app/shared/models/scoreboards.model';
import { Teams } from '@app/shared/models/teams.models';
import { Users } from '@app/shared/models/users.model';
import { ThirdPartyApiService } from '@app/core/services/thirdPartyApiService/third-party-api.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, MatDialogModule, NgIf, AsyncPipe, FormsModule, NgFor],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class HeaderComponent implements OnDestroy {
  readonly dialog = inject(MatDialog);
  authService = inject(AuthService);
  router = inject(Router);

  isAdmin!: Observable<boolean>;
  loggedIn!: Observable<boolean>;
  searchQuery: string = '';
  scoreboards: Scoreboards[] = [];
  teams: Teams[] = [];
  users: Users[] = [];
  filteredResults: (Scoreboards | Teams | Users)[] = [];
  showDropdown: boolean = false;
  isDropdownOpen: boolean = false;
  userImageUrl: string = '';
  teamImageUrl: string = '';
  scoreboardImageUrl: string = '';
  imageUrls: { [key: string]: string } = {};
  isHeaderVisible: boolean = true;
  fullscreenElement: any;

  private destroy$ = new Subject<void>();

  constructor(private search: SearchService, private elementRef: ElementRef, private thirdPartyApiService: ThirdPartyApiService, @Inject(DOCUMENT) protected document: any) {
    if (typeof window !== 'undefined' && typeof location !== 'undefined' && this.authService) {
      this.fullscreenElement = document.documentElement;
      this.isAdmin = this.authService.isAdmin;
      this.loggedIn = this.authService.loggedIn;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getUserID(): number {
    return this.authService.getUserID();
  }

  toggleLoginModal() {
    this.dialog.open(LoginComponent);
  }

  toggleRegisterModal() {
    this.dialog.open(RegisterComponent);
  }

  logoutButton() {
    this.authService.logout();
  }

  submitQuery(form: NgForm) {
    this.onSearchInputChange();
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { queryParams: { query: this.searchQuery } });
      this.isDropdownOpen = false;
      form.resetForm();
    }
  }

  onSearchInputChange() {
    if (!this.searchQuery.trim()) {
      this.filteredResults = [];
      this.isDropdownOpen = false;
      return;
    }

    this.search.getAllTeamsUsersScoreboards().then(
      (response) => {
        this.scoreboards = response.scoreboards || [];
        this.teams = response.teams || [];
        this.users = response.users || [];

        const allResults = [
          ...this.scoreboards.map(scoreboard => ({ ...scoreboard, type: 'scoreboard' })),
          ...this.teams.map(team => ({ ...team, type: 'team' })),
          ...this.users.map(user => ({ ...user, type: 'user' }))
        ];

        this.filteredResults = allResults.filter(result => {
          const name = this.getResultName(result).toLowerCase();
          return name.includes(this.searchQuery.toLowerCase());
        }).sort((a, b) => {
          const nameA = this.getResultName(a).toLowerCase();
          const nameB = this.getResultName(b).toLowerCase();
          const query = this.searchQuery.toLowerCase();

          if (nameA.startsWith(query) && !nameB.startsWith(query)) {
            return -1;
          }
          if (!nameA.startsWith(query) && nameB.startsWith(query)) {
            return 1;
          }

          const matchCountA = [...nameA.matchAll(new RegExp(query, 'g'))].length;
          const matchCountB = [...nameB.matchAll(new RegExp(query, 'g'))].length;

          return matchCountB - matchCountA;
        });

        // Hämta bilder för varje resultat
        this.filteredResults.forEach((result, index) => {
          this.getImageFromApi(result, index.toString());
        });

        this.isDropdownOpen = true;
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  getResultName(result: Scoreboards | Teams | Users): string {
    if ('name' in result) {
      return result.name;
    } else if ('teamName' in result) {
      return result.teamName;
    } else if ('username' in result) {
      return result.username;
    }
    return 'Okänt namn';
  }

  getImageFromApi(result: any, key: string): void {
    if (result.type === 'scoreboard') {
      this.thirdPartyApiService.getScoreboardImage().then(
        (response) => {
          this.imageUrls[key] = this.getImageSize(response);
        },
      );
    } else if (result.type === 'team') {
      this.thirdPartyApiService.getTeamImage().then(
        (response) => {
          this.imageUrls[key] = this.getImageSize(response);
        },
      );
    } else if (result.type === 'user') {
      this.thirdPartyApiService.getUserImage().then(
        (response) => {
          this.imageUrls[key] = this.getImageSize(response);
        },
      );
    }
  }

  getImageSize(result: any): string {
    if (result.raster_sizes && result.raster_sizes.length > 0) {
      for (const size of result.raster_sizes) {
        if (size.size === 256 && size.formats && size.formats.length > 0) {
          return size.formats[0].preview_url;
        }
      }
    }
    console.error('No image with size 256x256 found in response:', result);
    return '';
  }

  getRouterLink(result: Scoreboards | Teams | Users): string[] {
    if ('scoreboardId' in result) {
      return ['/scoreboard', result.scoreboardId?.toString() ?? ''];
    } else if ('teamID' in result) {
      return ['/team', result.teamID.toString()];
    } else if ('userId' in result) {
      return ['/user', result.userId.toString()];
    }
    return [];
  }

  @HostListener('document:click', ['$event'])
  handleClick(event: Event) {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.isDropdownOpen = false;
    }
  }

  toggleFullscreen() {
    this.isHeaderVisible = !this.isHeaderVisible;
    if (!this.document.fullscreenElement) {
      this.document.documentElement.requestFullscreen();
    } else {
      this.document.exitFullscreen();
    }
  }

  @HostListener('document:fullscreenchange', ['$event'])
  @HostListener('document:webkitfullscreenchange', ['$event'])
  @HostListener('document:mozfullscreenchange', ['$event'])
  @HostListener('document:MSFullscreenChange', ['$event'])
  onFullscreenChange(event: Event) {
    this.isHeaderVisible = !this.document.fullscreenElement;
  }

}
