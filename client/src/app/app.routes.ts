import { Routes } from '@angular/router';
import { ActiveScoreboardsComponent } from './shared/components/active-scoreboards/active-scoreboards.component';
import { ScoreboardsHistoryComponent } from './shared/components/scoreboards-history/scoreboards-history.component';
import { HomeComponent } from '../app/shared/components/home/home.component';
import { ScoreboardDetailsComponent } from '../app/shared/components/scoreboard-details/scoreboard-details.component';
import { AdminComponent } from '../app/shared/components/admin/admin.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'Startsida - Poängtavlan'
  },
  {
    path: 'active-scoreboards',
    component: ActiveScoreboardsComponent,
    title: 'Aktiva Poängtavlor'
  },
  {
    path: 'scoreboards-history',
    component: ScoreboardsHistoryComponent,
    title: 'Poängtavlor - Historik'
  },
  {
    path: 'scoreboard/:id',
    component: ScoreboardDetailsComponent,
    title: 'Poängtavla'
  },
  {
    path: 'admin',
    component: AdminComponent,
    title: 'Admin'
  }
];