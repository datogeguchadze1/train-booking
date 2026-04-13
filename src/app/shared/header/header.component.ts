import { Component, HostListener, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="header" [class.scrolled]="scrolled()">
      <div class="hcontainer">
        <nav class="nav">
          <a routerLink="/" class="logo">
            <span>🚂</span>
            <span class="logo-text">Train<span class="lo-accent">Ticket</span></span>
          </a>
          <ul class="nav-links" [class.open]="menuOpen()">
            <li><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">მთავარი</a></li>
            <li><a routerLink="/trains" routerLinkActive="active">მატარებლები</a></li>
            <li><a routerLink="/my-tickets" routerLinkActive="active">ჩემი ბილეთები</a></li>
          </ul>
          <div class="nav-actions">
            <a routerLink="/my-tickets" class="btn btn-outline btn-sm desktop-only">🎫 ბილეთები</a>
            <a routerLink="/" class="btn btn-primary btn-sm">ძებნა</a>
            <button class="hamburger" (click)="menuOpen.update(v=>!v)">
              {{ menuOpen() ? '✕' : '☰' }}
            </button>
          </div>
        </nav>
      </div>
    </header>
  `,
  styles: [`
    .header { position:sticky;top:0;z-index:100;height:72px;background:rgba(7,7,26,.85);backdrop-filter:blur(20px);border-bottom:1px solid transparent;transition:all .2s ease; }
    .header.scrolled { border-bottom-color:var(--border);background:rgba(7,7,26,.97); }
    .hcontainer { max-width:1200px;margin:0 auto;padding:0 24px;height:100%; }
    .nav { display:flex;align-items:center;justify-content:space-between;height:100%;gap:32px; }
    .logo { display:flex;align-items:center;gap:10px;text-decoration:none;font-size:20px;font-weight:800;color:var(--text-primary);letter-spacing:-.02em;flex-shrink:0; }
    .lo-accent { color:var(--accent); }
    .nav-links { display:flex;align-items:center;gap:4px;list-style:none;flex:1; }
    .nav-links a { display:block;padding:8px 14px;border-radius:var(--radius-md);font-size:14px;font-weight:500;color:var(--text-secondary);text-decoration:none;transition:all .2s ease; }
    .nav-links a:hover { color:var(--text-primary);background:var(--bg-elevated); }
    .nav-links a.active { color:var(--accent);background:var(--accent-soft); }
    .nav-actions { display:flex;align-items:center;gap:10px;flex-shrink:0; }
    .hamburger { display:none;background:none;border:none;color:var(--text-primary);font-size:20px;cursor:pointer;padding:8px;border-radius:var(--radius-sm); }
    @media(max-width:768px) {
      .hamburger{display:flex}
      .desktop-only{display:none}
      .nav-links{display:none;position:absolute;top:72px;left:0;right:0;background:var(--bg-card);border-bottom:1px solid var(--border);flex-direction:column;padding:12px 16px;gap:4px}
      .nav-links.open{display:flex}
      .nav-links a{padding:12px 16px;font-size:15px}
    }
  `]
})
export class HeaderComponent {
  scrolled = signal(false);
  menuOpen = signal(false);
  @HostListener('window:scroll') onScroll() { this.scrolled.set(window.scrollY > 20); }
}
