export interface Station { id: number; name: string; city?: string; }
export interface Train { id: number; name: string; number?: string; type?: string; }
export interface Seat { id: number; vagonId?: number; number: number; isAvailable: boolean; type?: string; }
export interface Vagon { id: number; trainId?: number; number: number; type?: string; capacity?: number; seats?: Seat[]; }
export interface Departure {
  id: number; trainId?: number; train?: Train;
  fromStation?: string; toStation?: string;
  fromStationId?: number; toStationId?: number;
  departureTime?: string; arrivalTime?: string;
  date?: string; price?: number; availableSeats?: number; duration?: string;
  [key: string]: unknown;
}
export interface TicketTrainInfo { trainId?: string|number; trainName?: string; station?: string; fromStation?: string; toStation?: string; paymentCompleted?: boolean; }
export interface TicketRegisterRequest { trainId: number; date: string; name: string; train?: TicketTrainInfo; seatId?: number; vagonId?: number; }
export interface Ticket { id?: string; name?: string; date?: string; status?: string; paymentCompleted?: boolean; train?: TicketTrainInfo; seat?: Seat; vagon?: Vagon; departure?: Departure; [key: string]: unknown; }
export interface SearchParams { from?: string; to?: string; date?: string; fromId?: number; toId?: number; }
