import { Component } from '@angular/core';
import {ChangeDetectionStrategy} from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButton } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { Team } from '../models/team.model'
import { Admin } from '../models/admin.model'
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'select-overview-example',
  templateUrl: 'select-overview-example.html',
  imports: [MatFormFieldModule, MatSelectModule, MatInputModule, FormsModule],
})
export class SelectOverviewExample {}

@Component({
  selector: 'button-overview-example',
  templateUrl: 'button-overview-example.html',
  styleUrl: 'button-overview-example.css',
  imports: [MatButtonModule, MatDividerModule, MatIconModule],
})
export class ButtonOverviewExample {}

@Component({
  selector: 'app-admin',
  imports: [],
  template: `
  <section>
    <form>
      <input type="text" placeholder="Filter by city" />
      <button class="primary" type="button">Search</button>
    </form>
  </section>
`,
  styleUrl: './admin.component.css'
})
export class AdminComponent {

}
