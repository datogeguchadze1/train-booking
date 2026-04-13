import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Ticket } from '../../core/models/api.models';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './confirmation.component.html',
  styleUrl: './confirmation.component.scss'
})
export class ConfirmationComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  loading = signal(false);
  ticket = signal<Ticket|null>(null);
  ticketId = signal('');
  from = signal(''); to = signal('');
  confirming = signal(false); cancelling = signal(false);
  actionMsg = signal(''); actionOk = signal(false);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('ticketId') ?? '';
    this.ticketId.set(id);
    const state = history.state as {ticket?:Ticket;from?:string;to?:string};
    if (state?.ticket) {
      this.ticket.set(state.ticket);
      this.from.set(state.from ?? '');
      this.to.set(state.to ?? '');
    } else if (id && id !== 'new') {
      this.loading.set(true);
      this.api.checkTicketStatus(id).subscribe({
        next: d => { this.ticket.set(d); this.loading.set(false); },
        error: () => this.loading.set(false)
      });
    }
  }

  confirmTicket() {
    const id = this.ticketId(); if (!id || id==='new') return;
    this.confirming.set(true); this.actionMsg.set('');
    this.api.confirmTicket(id).subscribe({
      next: d => { this.ticket.set(d); this.confirming.set(false); this.actionMsg.set('✅ ბილეთი დადასტურდა!'); this.actionOk.set(true); },
      error: () => { this.confirming.set(false); this.actionMsg.set('⚠️ დადასტურება ვერ მოხერხდა.'); this.actionOk.set(false); }
    });
  }

  cancelTicket() {
    if (!confirm('დარწმუნებული ხართ გაუქმებაში?')) return;
    const id = this.ticketId();
    if (!id || id==='new') { this.router.navigate(['/']); return; }
    this.cancelling.set(true);
    this.api.cancelTicket(id).subscribe({
      next: () => { this.cancelling.set(false); this.actionMsg.set('ბილეთი გაუქმდა.'); this.actionOk.set(true); setTimeout(()=>this.router.navigate(['/my-tickets']),1500); },
      error: () => { this.cancelling.set(false); this.actionMsg.set('⚠️ გაუქმება ვერ მოხერხდა.'); this.actionOk.set(false); }
    });
  }

  formatDate(d: string): string {
    if (!d) return '—';
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? d : dt.toLocaleDateString('ka-GE',{day:'numeric',month:'long',year:'numeric'});
  }

  isConfirmed(): boolean { return !!(this.ticket()?.paymentCompleted || this.ticket()?.status==='confirmed'); }
}
