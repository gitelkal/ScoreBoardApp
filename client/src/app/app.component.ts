import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
    template: `
  <main>

    <header class="brand-name">
      <img class="brand-logo" src="/assets/logo.svg" alt="logo" aria-hidden="true" />
    </header>

  <section class="content">

  </section>
</main>
`,
styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'client';
}
