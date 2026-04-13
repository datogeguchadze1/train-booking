import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Vagon, Seat } from '../../core/models/api.models';

type Step = 'wagon'|'seat'|'passenger';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.scss'
})
export class BookingComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  step = signal<Step>('wagon');
  loadingVagons = signal(true);
  loadingSeats = signal(false);
  booking = signal(false);

  vagons = signal<Vagon[]>([]);
  seats = signal<Seat[]>([]);
  selVagon = signal<Vagon|null>(null);
  selSeat = signal<Seat|null>(null);

  trainId = signal(0);
  from = signal(''); to = signal(''); date = signal('');

  passengerName = ''; email = ''; phone = '';
  nameError = signal(''); bookingError = signal('');

  steps: {key:Step;label:string}[] = [
    {key:'wagon',label:'ვაგონი'},
    {key:'seat',label:'ადგილი'},
    {key:'passenger',label:'მგზავრი'}
  ];

  seatRows = computed(() => {
    const all = this.seats();
    const rows: {num:number; seats:(Seat|null)[]}[] = [];
    for (let i = 0; i < all.length; i+=4) {
      const c = all.slice(i,i+4);
      rows.push({ num: Math.floor(i/4)+1, seats: [c[0]??null, c[1]??null, null, c[2]??null, c[3]??null] });
    }
    return rows;
  });

  ngOnInit() {
    this.trainId.set(Number(this.route.snapshot.paramMap.get('trainId'))||0);
    this.route.queryParams.subscribe(p => {
      this.from.set(p['from']||''); this.to.set(p['to']||''); this.date.set(p['date']||'');
    });
    this.loadVagons();
  }

  loadVagons() {
    this.loadingVagons.set(true);
    this.api.getVagons().subscribe({
      next: d => {
        const f = d.filter(v => !v.trainId || v.trainId === this.trainId());
        this.vagons.set(f.length > 0 ? f : d.slice(0,5));
        this.loadingVagons.set(false);
      },
      error: () => {
        this.vagons.set([
          {id:1,number:1,type:'economy',capacity:54},
          {id:2,number:2,type:'economy',capacity:54},
          {id:3,number:3,type:'business',capacity:32}
        ]);
        this.loadingVagons.set(false);
      }
    });
  }

  loadSeats(v: Vagon) {
    this.loadingSeats.set(true); this.seats.set([]);
    this.api.getVagonById(v.id).subscribe({
      next: d => {
        const s = (d as Vagon & {seats?:Seat[]}).seats;
        this.seats.set(s?.length ? s : this.mockSeats(v.capacity??40));
        this.loadingSeats.set(false);
      },
      error: () => { this.seats.set(this.mockSeats(v.capacity??40)); this.loadingSeats.set(false); }
    });
  }

  mockSeats(n: number): Seat[] {
    return Array.from({length:n},(_,i) => ({id:i+1,number:i+1,isAvailable:Math.random()>.3}));
  }

  goStep(s: Step) {
    if (s==='seat' && this.selVagon()) this.loadSeats(this.selVagon()!);
    this.step.set(s);
  }

  isDone(s: Step): boolean {
    const order: Step[] = ['wagon','seat','passenger'];
    const cur = order.indexOf(this.step());
    if (s==='wagon') return cur>0 && !!this.selVagon();
    if (s==='seat') return cur>1 && !!this.selSeat();
    if (s==='passenger') return !!this.passengerName;
    return false;
  }

  confirm() {
    this.nameError.set(''); this.bookingError.set('');
    if (!this.passengerName.trim()) { this.nameError.set('სახელი სავალდებულოა'); return; }
    this.booking.set(true);
    const body = {
      trainId: this.trainId(),
      date: this.date() || new Date().toISOString(),
      name: this.passengerName.trim(),
      seatId: this.selSeat()?.id,
      vagonId: this.selVagon()?.id,
      train: { trainId: String(this.trainId()), trainName: `მატარებელი #${this.trainId()}`, station: this.from(), paymentCompleted: true }
    };
    this.api.registerTicket(body).subscribe({
      next: ticket => {
        this.booking.set(false);
        this.router.navigate(['/confirmation', ticket?.id ?? 'new'], {
          state: { ticket, from: this.from(), to: this.to() }
        });
      },
      error: err => {
        this.booking.set(false);
        const msg = err?.error?.message || err?.error || 'ბრონირება ვერ მოხერხდა.';
        this.bookingError.set(typeof msg==='string' ? msg : JSON.stringify(msg));
      }
    });
  }

  vagonLabel(v: Vagon): string {
    const m: Record<string,string> = {economy:'ეკონომი',business:'ბიზნესი',first:'პირველი კლასი'};
    return m[v.type?.toLowerCase()??''] ?? v.type ?? 'ეკონომი';
  }

  formatDate(d: string): string {
    if (!d) return '';
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? d : dt.toLocaleDateString('ka-GE',{day:'numeric',month:'long',year:'numeric'});
  }

  goBack() { this.router.navigate(['/trains'],{queryParams:{from:this.from(),to:this.to(),date:this.date()}}); }
}
