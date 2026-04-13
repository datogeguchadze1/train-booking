import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Departure, Train } from '../../core/models/api.models';

@Component({
  selector: 'app-trains',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './trains.component.html',
  styleUrl: './trains.component.scss'
})
export class TrainsComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  loading = signal(true);
  error = signal('');
  items = signal<(Departure|Train)[]>([]);
  sortBy = 'default';
  from = signal(''); to = signal(''); date = signal('');

  filteredItems = computed(() => {
    const list = this.items();
    if (this.sortBy === 'price-asc') return [...list].sort((a,b) => this.getPrice(a)-this.getPrice(b));
    if (this.sortBy === 'price-desc') return [...list].sort((a,b) => this.getPrice(b)-this.getPrice(a));
    return list;
  });

  ngOnInit() {
    this.route.queryParams.subscribe(p => {
      this.from.set(p['from']||''); this.to.set(p['to']||''); this.date.set(p['date']||'');
      this.loadData();
    });
  }

  loadData() {
    this.loading.set(true); this.error.set('');
    this.api.getDeparture({ from: this.from(), to: this.to(), date: this.date() }).subscribe({
      next: d => { this.items.set(Array.isArray(d)?d:(d?[d]:[])); this.loading.set(false); },
      error: () => {
        this.api.getTrains().subscribe({
          next: t => { this.items.set(t); this.loading.set(false); },
          error: () => { this.error.set('მონაცემების ჩატვირთვა ვერ მოხერხდა.'); this.loading.set(false); }
        });
      }
    });
  }

  book(item: Departure|Train) {
    const id = this.getId(item);
    this.router.navigate(['/booking', id], {
      queryParams: { from: this.from(), to: this.to(), date: this.date() },
      state: { trainData: item }
    });
  }

  formatDate(d: string): string {
    if (!d) return '';
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? d : dt.toLocaleDateString('ka-GE', { day:'numeric', month:'long', year:'numeric' });
  }

  getId(i: Departure|Train): number { return (i as Train).id ?? 0; }
  getName(i: Departure|Train): string { const d=i as Departure; return d.train?.name ?? (i as Train).name ?? `მატარებელი #${this.getId(i)}`; }
  getType(i: Departure|Train): string { return (i as Train).type ?? 'Express'; }
  getDepTime(i: Departure|Train): string { return (i as Departure).departureTime ?? '--:--'; }
  getArrTime(i: Departure|Train): string { return (i as Departure).arrivalTime ?? '--:--'; }
  getFromSt(i: Departure|Train): string { return (i as Departure).fromStation ?? ''; }
  getToSt(i: Departure|Train): string { return (i as Departure).toStation ?? ''; }
  getDuration(i: Departure|Train): string { return (i as Departure).duration ?? '~'; }
  getPrice(i: Departure|Train): number { return (i as Departure).price ?? 0; }
}
