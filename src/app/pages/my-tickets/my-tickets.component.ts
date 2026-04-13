import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { JsonPipe } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { Ticket } from '../../core/models/api.models';

@Component({
  selector: 'app-my-tickets',
  standalone: true,
  imports: [RouterLink, JsonPipe],
  templateUrl: './my-tickets.component.html',
  styleUrl: './my-tickets.component.scss'
})
export class MyTicketsComponent implements OnInit {
  private api = inject(ApiService);

  loading = signal(true);
  error = signal('');
  tickets = signal<Ticket[]>([]);
  cancellingAll = signal(false);
  checkingId = ''; confirmingId = ''; cancellingId = '';
  toast = signal(''); toastType = signal<'success'|'error'>('success');
  statusDetails: Record<string,Ticket> = {};

  ngOnInit() { this.loadTickets(); }

  loadTickets() {
    this.loading.set(true); this.error.set('');
    this.api.getTickets().subscribe({
      next: d => { this.tickets.set(Array.isArray(d)?d:[]); this.loading.set(false); },
      error: () => { this.error.set('ბილეთების ჩატვირთვა ვერ მოხერხდა.'); this.loading.set(false); }
    });
  }

  checkStatus(t: Ticket) {
    const id = this.getId(t); if (!id) return;
    this.checkingId = id;
    this.api.checkTicketStatus(id).subscribe({
      next: d => { this.statusDetails[id]=d; this.checkingId=''; this.tickets.update(l=>l.map(x=>this.getId(x)===id?{...x,...d}:x)); },
      error: () => { this.checkingId=''; this.showToast('⚠️ სტატუსი ვერ ჩაიტვირთა','error'); }
    });
  }

  confirmTicket(t: Ticket) {
    const id = this.getId(t); if (!id) return;
    this.confirmingId = id;
    this.api.confirmTicket(id).subscribe({
      next: d => { this.confirmingId=''; this.tickets.update(l=>l.map(x=>this.getId(x)===id?{...x,...d,paymentCompleted:true}:x)); this.showToast('✅ ბილეთი დადასტურდა!','success'); },
      error: () => { this.confirmingId=''; this.showToast('⚠️ დადასტურება ვერ მოხერხდა','error'); }
    });
  }

  cancelTicket(t: Ticket) {
    if (!confirm('გაუქმება?')) return;
    const id = this.getId(t); if (!id) return;
    this.cancellingId = id;
    this.api.cancelTicket(id).subscribe({
      next: () => { this.cancellingId=''; this.tickets.update(l=>l.filter(x=>this.getId(x)!==id)); this.showToast('ბილეთი გაუქმდა.','success'); },
      error: () => { this.cancellingId=''; this.showToast('⚠️ გაუქმება ვერ მოხერხდა','error'); }
    });
  }

  cancelAll() {
    if (!confirm('ყველა ბილეთი გაუქმდება?')) return;
    this.cancellingAll.set(true);
    this.api.cancelAllTickets().subscribe({
      next: () => { this.tickets.set([]); this.cancellingAll.set(false); this.showToast('ყველა ბილეთი გაუქმდა.','success'); },
      error: () => { this.cancellingAll.set(false); this.showToast('⚠️ გაუქმება ვერ მოხერხდა','error'); }
    });
  }

  showToast(m: string, t: 'success'|'error') { this.toast.set(m); this.toastType.set(t); setTimeout(()=>this.toast.set(''),3500); }

  confirmedCount() { return this.tickets().filter(t=>t.paymentCompleted||t.status==='confirmed').length; }
  pendingCount() { return this.tickets().filter(t=>!t.paymentCompleted&&t.status!=='confirmed').length; }
  getId(t: Ticket) { return String(t.id??''); }
  getFrom(t: Ticket) { return t.train?.fromStation??t.train?.station??'—'; }
  getTo(t: Ticket) { return t.train?.toStation??t.departure?.toStation??'—'; }
  isConfirmed(t: Ticket) { return !!(t.paymentCompleted||t.status==='confirmed'); }
  getStatusClass(t: Ticket) { return this.isConfirmed(t)?'badge-success':(t.status==='cancelled'?'badge-error':'badge-warning'); }
  getStatusLabel(t: Ticket) { return this.isConfirmed(t)?'✓ დადასტურებული':(t.status==='cancelled'?'✕ გაუქმებული':'⏳ მოლოდინი'); }
  formatDate(d?: string) {
    if (!d) return '—';
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? d : dt.toLocaleDateString('ka-GE',{day:'numeric',month:'long',year:'numeric'});
  }
}
