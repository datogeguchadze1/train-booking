import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Station, Train, Vagon, Seat, Departure, Ticket, TicketRegisterRequest, SearchParams } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = 'https://railway.stepprojects.ge/api';

  getStations(): Observable<Station[]> { return this.http.get<Station[]>(`${this.base}/stations`); }
  getTrains(): Observable<Train[]> { return this.http.get<Train[]>(`${this.base}/trains`); }
  getTrainById(id: number): Observable<Train> { return this.http.get<Train>(`${this.base}/trains/${id}`); }
  getVagons(): Observable<Vagon[]> { return this.http.get<Vagon[]>(`${this.base}/vagons`); }
  getVagonById(id: number): Observable<Vagon> { return this.http.get<Vagon>(`${this.base}/getvagon/${id}`); }
  getDepartures(): Observable<Departure[]> { return this.http.get<Departure[]>(`${this.base}/departures`); }
  getDeparture(params?: SearchParams): Observable<Departure[]> {
    let p = new HttpParams();
    if (params) Object.entries(params).forEach(([k,v]) => { if (v !== undefined && v !== null && v !== '') p = p.set(k, String(v)); });
    return this.http.get<Departure[]>(`${this.base}/getdeparture`, { params: p });
  }
  getTickets(): Observable<Ticket[]> { return this.http.get<Ticket[]>(`${this.base}/tickets`); }
  registerTicket(body: TicketRegisterRequest): Observable<Ticket> { return this.http.post<Ticket>(`${this.base}/tickets/register`, body); }
  checkTicketStatus(id: string): Observable<Ticket> { return this.http.get<Ticket>(`${this.base}/tickets/checkstatus/${id}`); }
  confirmTicket(id: string): Observable<Ticket> { return this.http.get<Ticket>(`${this.base}/tickets/confirm/${id}`); }
  cancelTicket(id: string): Observable<unknown> { return this.http.delete(`${this.base}/tickets/cancel/${id}`); }
  cancelAllTickets(): Observable<unknown> { return this.http.delete(`${this.base}/tickets/cancelAll`); }
  getSeat(seatId: number): Observable<Seat> { return this.http.get<Seat>(`${this.base}/seat/${seatId}`); }
}
