import { Routes } from '@angular/router';

// Componentes de autenticación y páginas generales
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { HomeComponent } from './pages/home/home.component';
import { CalendarViewComponent } from './pages/calendar-view/calendar-view.component';

import { BookingCreateComponent } from './pages/booking-create/booking-create.component';
import { BookingDetailComponent } from './pages/booking-detail/booking-detail.component';
import { ServiceCreateComponent } from './pages/service-create/service-create.component';
import { ServiceManagementComponent } from './pages/service-management/service-management.component';
import { ServiceEditComponent } from './pages/service-edit/service-edit.component';
import { TimeSlotCreateComponent } from './pages/timeslot-create/timeslot-create.component';

// --- GUARDIAS ---
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { ProviderProfileComponent } from './pages/provider-profile/provider-profile.component';
import { ExploreProvidersComponent } from './pages/explore-providers/explore-providers.component';

export const routes: Routes = [
  // Rutas públicas
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Rutas protegidas por autenticación general
  { path: 'home', component: HomeComponent, canActivate: [authGuard] },
  { path: 'calendar', component: CalendarViewComponent, canActivate: [authGuard] },
  
  // --- RUTAS DE BOOKING (CLIENTE) ---
  { 
    path: 'bookings/new', 
    component: BookingCreateComponent, 
    canActivate: [authGuard, roleGuard(['CLIENT'])] // Solo clientes pueden crear bookings
  },
  { 
    path: 'bookings/detail/:bookingUuid', 
    component: BookingDetailComponent, 
    canActivate: [authGuard] // La autorización específica (si es su booking) se hace en el servicio
  },
  
  // --- RUTAS DE SERVICIOS Y TIMESLOTS (PROVEEDOR) ---
  // Protegidas para asegurar que solo los proveedores accedan
  { 
    path: 'my-services', 
    component: ServiceManagementComponent, 
    canActivate: [authGuard, roleGuard(['PROVIDER'])] 
  },
  { 
    path: 'services/new', 
    component: ServiceCreateComponent, 
    canActivate: [authGuard, roleGuard(['PROVIDER'])] 
  },
  { 
    path: 'services/edit/:serviceUuid', 
    component: ServiceEditComponent, 
    canActivate: [authGuard, roleGuard(['PROVIDER'])] 
  },
  { 
    path: 'provider/timeslots/new', 
    component: TimeSlotCreateComponent, 
    canActivate: [authGuard, roleGuard(['PROVIDER'])] 
  },
  {
    path: 'explore', 
    component: ExploreProvidersComponent, 
    canActivate: [authGuard] 
  },
  { 
    path: 'providers/:providerUuid', 
    component: ProviderProfileComponent, 
    canActivate: [authGuard] 
  },

  // Redirecciones por defecto
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' } // Wildcard para rutas no encontradas
];