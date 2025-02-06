import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from '../app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HomeComponent } from '../home/home.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatCardModule,
    MatIconModule
  ],
  bootstrap: [AppComponent]
})

@NgModule({
    declarations: [AppComponent, HomeComponent],
    imports: [
      BrowserModule,
      BrowserAnimationsModule,
      MatTableModule,
      MatButtonModule,
      MatIconModule
    ],
    bootstrap: [AppComponent]
  })
export class AppModule {}