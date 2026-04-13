import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
  { path: 'trains', loadComponent: () => import('./pages/trains/trains.component').then(m => m.TrainsComponent) },
  { path: 'booking/:trainId', loadComponent: () => import('./pages/booking/booking.component').then(m => m.BookingComponent) },
  { path: 'confirmation/:ticketId', loadComponent: () => import('./pages/confirmation/confirmation.component').then(m => m.ConfirmationComponent) },
  { path: 'my-tickets', loadComponent: () => import('./pages/my-tickets/my-tickets.component').then(m => m.MyTicketsComponent) },
  { path: '**', redirectTo: '' }
];
