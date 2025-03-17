import { Routes } from '@angular/router';
import { ActiveScoreboardsComponent } from './shared/components/active-scoreboards/active-scoreboards.component';
import { ScoreboardsHistoryComponent } from './shared/components/scoreboards-history/scoreboards-history.component';
import { HomeComponent } from '../app/shared/components/home/home.component';
import { ScoreboardDetailsComponent } from '../app/shared/components/scoreboard-details/scoreboard-details.component';
import { AdminComponent } from '../app/shared/components/admin/admin.component';
import { TeamComponent } from '../app/shared/components/team/team.component';
import { TeamDetailsComponent } from '../app/shared/components/team-details/team-details.component';
import { UserComponent } from './shared/components/user/user.component';
import { ForgotPasswordComponent } from './shared/components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './shared/components/reset-password/reset-password.component';
import { ScoreboardVBarViewComponent } from './shared/components/scoreboard-v-bar-view/scoreboard-v-bar-view.component';
import { SearchComponent } from './shared/components/search/search.component';
import { ScoreboardDarkComponent } from './shared/components/scoreboard-dark/scoreboard-dark.component';
import { ScoreboardTaskViewComponent } from './shared/components/scoreboard-task-view/scoreboard-task-view.component';

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
  },
  {
    path: 'team',
    component: TeamComponent,
    title: 'Lag'
  },
  {
    path:'team/:teamID',
    component: TeamDetailsComponent,
    title: 'Lag - Detaljer'
  },
  {
    path: 'user/:userID',
    component: UserComponent, 
    title: 'Användare'
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
    title: 'Glömt Lösenord'
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
    title: 'Återställ Lösenord'
  },
  {
    path: 'scoreboard-dark/:id',
    component: ScoreboardDarkComponent,
    title: 'Poängtavla - Black'
  },
  {
    path: 'scoreboard-v-bar-view/:id',
    component: ScoreboardVBarViewComponent,
    title: 'Poängtavla - Stapelvy'
  },
  {
    path: 'search',
    component: SearchComponent,
    title: 'Sökresultat'
  },
  {
    path: 'scoreboard-task-view/:id',
    component: ScoreboardTaskViewComponent,
    title: 'Poängtavla - Uppgifter'
  }
];