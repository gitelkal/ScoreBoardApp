import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LoginComponent } from '../login/login.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-header',
  imports: [RouterLink, MatDialogModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class HeaderComponent {
  readonly dialog = inject(MatDialog);


  toggleLogin() {
    this.dialog.open(LoginComponent);
  }

}
