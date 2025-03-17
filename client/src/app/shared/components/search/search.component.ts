import { Component, OnInit } from '@angular/core';
import { ActivatedRoute ,RouterLink } from '@angular/router';
import { SearchService } from '@app/core/services/searchService/search.service';
import { Scoreboards } from '@app/shared/models/scoreboards.model';
import { Teams } from '@app/shared/models/teams.models';
import { Users } from '@app/shared/models/users.model';
import { NgFor, NgIf, CommonModule } from '@angular/common';

@Component({
  selector: 'app-search',
  imports: [RouterLink, NgFor, NgIf, CommonModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent implements OnInit {
  searchQuery: string = '';
  scoreboards: Scoreboards[] = [];
  teams: Teams[] = [];
  users: Users[] = [];
  filteredResults: ({ type: string } & (Scoreboards | Teams | Users))[] = [];
  sortedResults: ({ type: string } & (Scoreboards | Teams | Users))[] = [];

  constructor(private route: ActivatedRoute, private searchService: SearchService) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['query'];
      if (this.searchQuery) {
        this.performSearch();
      }
    });
  }

  async performSearch(): Promise<void> {
    try {
      const response = await this.searchService.submit(this.searchQuery);
      this.scoreboards = response.scoreboards || [];
      this.teams = response.teams || [];
      this.users = response.users || [];
  
      this.filteredResults = [
        ...this.scoreboards.map(scoreboard => ({ ...scoreboard, type: 'scoreboard' })),
        ...this.teams.map(team => ({ ...team, type: 'team' })),
        ...this.users.map(user => ({ ...user, type: 'user' }))
      ];
      this.sortResults(this.filteredResults);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  getResultName(result: Scoreboards | Teams | Users): string {
    if ('name' in result) {
      return result.name;
    } else if ('teamName' in result) {
      return result.teamName;
    } else if ('username' in result) {
      return result.username;
    }
    return 'Unknown name';
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

  getResultTitle(result: { type: string } & (Scoreboards | Teams | Users)): string {
    if (result.type === 'scoreboard') {
      return 'Tävling:';
    } else if (result.type === 'team') {
      return 'Lag:';
    } else if (result.type === 'user') {
      return 'Användare:';
    }
    return 'Okänd';
  }

  getScoreboardDescription(result: Scoreboards): string {
    if ('description' in result && result.description) {
      const words = result.description.split(' ');
      return words.slice(0, 10).join(' ') + (words.length > 10 ? '...' : '');
    }
    return '';
  }
  
  getUserFullName(result: Users): string {
    if ('firstname' in result && 'lastname' in result) {
      return `${result.firstname} ${result.lastname}`;
    }
    return '';
  }

  isScoreboard(result: any): result is Scoreboards {
    return result.type === 'scoreboard';
  }
  
  isUser(result: any): result is Users {
    return result.type === 'user';
  }

  sortResults(filteredResults: ({ type: string } & (Scoreboards | Teams | Users))[]): void {
    this.sortedResults = filteredResults.sort((a, b) => {
      const aName = this.getResultName(a).toLowerCase();
      const bName = this.getResultName(b).toLowerCase();
      const query = this.searchQuery.toLowerCase();
      const aStartsWith = aName.startsWith(query);
      const bStartsWith = bName.startsWith(query);

      if (aStartsWith && !bStartsWith) {
        return -1;
      } else if (!aStartsWith && bStartsWith) {
        return 1;
      } else {
        return aName.localeCompare(bName);
      }
    });
  }
}
