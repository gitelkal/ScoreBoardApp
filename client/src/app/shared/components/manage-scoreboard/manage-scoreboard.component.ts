// ★ Scoreboard Component
import { ScoreboardService } from '@app/core/services/scoreboardService/scoreboard.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Output,
  OnInit,
  inject,
  ElementRef,
  ViewChild,
  HostListener,
} from '@angular/core';
import { NgForOf } from '@angular/common';

@Component({
  selector: 'app-manage-scoreboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NgForOf],
  templateUrl: './manage-scoreboard.component.html',
  styleUrls: ['./manage-scoreboard.component.css'],
})
export class ManageScoreboardComponent implements OnInit {
  private scoreboardService = inject(ScoreboardService);

  @Output() scoreboardCreated = new EventEmitter<any>();
  @ViewChild('dropdown') dropdown!: ElementRef;

  selectedScoreboard: any = {
    scoreboardId: null,
    name: '',
    startedAt: '',
    endedAt: '',
    active: false,
    description: '',
  };

  scoreboards: any[] = [];
  filteredScoreboards: any[] = [];
  searchQuery: string = '';
  showDropdown: boolean = false;
  selectedScoreboardId?: number;
  selectedScoreboardName?: string;
  existingScoreboards: any[] = [];

  scoreboardData: {
    scoreboardId: number;
    name: string;
    startedAt: string;
    endedAt: string;
    active: boolean;
    description: string;
  } = {
    scoreboardId: 0,
    name: '',
    startedAt: '',
    endedAt: '',
    active: false,
    description: '',
  };

  ngOnInit(): void {
    this.fetchScoreboards();
  }

  fetchScoreboards() {
    this.scoreboardService.getAllScoreboards().subscribe(
      (data) => {
        this.scoreboards = data;
        this.filteredScoreboards = data;
      },
      (error) => {
        console.error('Fel vid hämtning av poängtavlor:', error);
      }
    );
  }

  createScoreboard() {
    if (!this.scoreboardData || !this.scoreboardData.name.trim()) {
      alert('Tävlingsnamn  krävs!');
      return;
    }

    const payload = {
      scoreboardId: 0,
      name: this.scoreboardData.name,
      startedAt: this.scoreboardData.startedAt,
      endedAt: this.scoreboardData.endedAt,
      active: this.scoreboardData.active,
      description: this.scoreboardData.description,
    };

    console.log('📤 Skickar till backend:', JSON.stringify(payload, null, 2));

    this.scoreboardService.createScoreboard(payload).subscribe(
      (response) => {
        console.log('✅ Scoreboard skapad:', response);

        if (response) {
          console.log(`Ny scoreboard skapad:`, response);
          this.fetchScoreboards();
          this.scoreboardCreated.emit(response);
          this.scoreboardData = {
            scoreboardId: 0,
            name: '',
            startedAt: '',
            endedAt: '',
            active: false,
            description: '',
          };
        } else {
          console.warn(' API returnerade null! Kolla backend.');
          alert('API returnerade null. Kontrollera backend.');
        }
      },
      (error) => {
        console.error('❌ Fel vid skapande:', error);
        alert('Något gick fel vid skapandet av tävling.');
      }
    );
  }

  // Filtrera scoreboards i sökrutan
  filterScoreboards() {
    if (!this.searchQuery.trim()) {
      this.filteredScoreboards = [];
      this.showDropdown = false;
      return;
    }

    this.filteredScoreboards = this.scoreboards.filter((scoreboard) =>
      scoreboard.name.toLowerCase().includes(this.searchQuery.toLowerCase())
    );

    this.showDropdown = this.filteredScoreboards.length > 0;
  }

  selectScoreboard(scoreboard: any) {
    console.log('Scoreboard valt:', scoreboard);

    this.selectedScoreboard = { ...scoreboard }; // Kopiera objektet
    this.searchQuery = scoreboard.name; // Behåll det gamla namnet i sökrutan
    this.showDropdown = false; // Stäng dropdownen
  }

  updateScoreboard() {
    console.log('Uppdaterar scoreboard:', this.selectedScoreboard);

    this.scoreboardService
      .updateScoreboard(
        this.selectedScoreboard.scoreboardId,
        this.selectedScoreboard
      )
      .subscribe({
        next: () => {
          alert('Tävlingspoängtavlan uppdaterad!');
          this.fetchScoreboards();
        },
        error: (err) => {
          console.error('Fel vid uppdatering:', err);
          alert('Ett fel uppstod vid uppdatering!');
        },
      });
  }
  
  @HostListener('document:click', ['$event'])
  closeDropdown(event: Event) {
    const clickedElement = event.target as HTMLElement;
  
    if (
      this.dropdown?.nativeElement.contains(clickedElement) || // Om klicket är inom dropdownen
      clickedElement.getAttribute('name') === 'searchQuery' || // Om klicket är i sökfältet
      clickedElement.getAttribute('name') === 'editName' // Om klicket är i namnändringsfältet
    ) {
      return; // Låt dropdownen vara öppen
    }
  
    this.showDropdown = false; // Annars, stäng dropdownen
  }
  
}
