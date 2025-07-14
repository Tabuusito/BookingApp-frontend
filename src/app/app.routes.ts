import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ReservationCreateComponent } from './pages/reservation-create/reservation-create.component';
import { CalendarViewComponent } from './pages/calendar-view/calendar-view.component';
import { HomeComponent } from './pages/home/home.component';
import { authGuard } from './guards/auth.guard';
import { ReservationDetailComponent } from './pages/reservation-detail/reservation-detail.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: HomeComponent, canActivate: [authGuard] },
  { path: 'reservations/detail/:id', component: ReservationDetailComponent, canActivate: [authGuard] },
  { path: 'reservations/new', component: ReservationCreateComponent, canActivate: [authGuard] },
  { path: 'calendar', component: CalendarViewComponent, canActivate: [authGuard] },
  
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];

export class AppRoutingModule { }
