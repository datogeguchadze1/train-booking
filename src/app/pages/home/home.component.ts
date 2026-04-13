import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Station } from '../../core/models/api.models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);

  stations = signal<Station[]>([]);
  searching = signal(false);
  errorMsg = signal('');
  from = ''; to = ''; date = '';
  today = new Date().toISOString().split('T')[0];

  popularRoutes = [
    { from: 'თბილისი', to: 'ბათუმი', duration: '4ს 30წ', price: 15 },
    { from: 'თბილისი', to: 'ქუთაისი', duration: '2ს 40წ', price: 10 },
    { from: 'ბათუმი', to: 'ქუთაისი', duration: '1ს 50წ', price: 8 },
    { from: 'თბილისი', to: 'ზუგდიდი', duration: '5ს 10წ', price: 18 },
    { from: 'ქუთაისი', to: 'ზუგდიდი', duration: '2ს 20წ', price: 9 },
    { from: 'ბათუმი', to: 'ზუგდიდი', duration: '3ს 00წ', price: 12 }
  ];

  ngOnInit() {
    this.api.getStations().subscribe({ next: d => this.stations.set(d), error: () => {} });
  }

  swapStations() { [this.from, this.to] = [this.to, this.from]; }

  selectRoute(r: {from:string;to:string}) { this.from = r.from; this.to = r.to; this.search(); }

  search() {
    this.errorMsg.set('');
    if (!this.from || !this.to) { this.errorMsg.set('გთხოვთ მიუთითოთ საწყისი და სასრული სადგური.'); return; }
    if (this.from === this.to) { this.errorMsg.set('საწყისი და სასრული სადგური ერთი და იგივე ვერ იქნება.'); return; }
    this.searching.set(true);
    this.router.navigate(['/trains'], { queryParams: { from: this.from, to: this.to, date: this.date } })
      .finally(() => this.searching.set(false));
  }
}
