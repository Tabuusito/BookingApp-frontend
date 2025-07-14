import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { authInterceptor } from './auth/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes),
              provideClientHydration(),
              provideHttpClient(withInterceptors([authInterceptor]), withFetch()),
              importProvidersFrom(NgbModule),

              importProvidersFrom(CalendarModule.forRoot({
                provide: DateAdapter,
                useFactory: adapterFactory,}))]
};
