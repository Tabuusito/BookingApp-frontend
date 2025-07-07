import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode'; // <-- Importa la librería

import { environment } from '../../environments/environment'
import { AuthResponse, LoginRequest, RegisterRequest } from './models/auth.models';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private readonly TOKEN_KEY = 'auth_token';

  private loggedIn = new BehaviorSubject<boolean>(false);
  private currentUser = new BehaviorSubject<string | null>(null);

  isLoggedIn$: Observable<boolean> = this.loggedIn.asObservable();
  currentUser$: Observable<string | null> = this.currentUser.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Cargar estado inicial desde localStorage si estamos en el navegador
    if (isPlatformBrowser(this.platformId)) {
      this.loadToken();
    }
  }

  private loadToken(): void {
    const token = this.getToken();
    if (token) {
      this.updateAuthState(token);
    }
  }

  // --- MÉTODOS PÚBLICOS DE AUTENTICACIÓN ---

  login(loginRequest: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/api/auth/login`, loginRequest).pipe(
      tap(response => {
        if (response && response.accessToken) {
          this.saveToken(response.accessToken);
          this.updateAuthState(response.accessToken);
          this.router.navigate(['/home']);
        }
      }),
      catchError(error => {
        // Limpiar estado en caso de error de login
        this.logoutInternal();
        return throwError(() => new Error('Usuario o contraseña incorrectos'));
      })
    );
  }

  register(registerRequest: RegisterRequest): Observable<string> {
    // La API devuelve un string, por eso responseType: 'text'
    return this.http.post(`${this.apiUrl}/api/auth/register`, registerRequest, { responseType: 'text' }).pipe(
      tap(() => {
        // Redirigir a login después de un registro exitoso
        this.router.navigate(['/login'], { queryParams: { registered: 'true' } });
      })
    );
  }

  logout(): void {
    this.logoutInternal();
    this.router.navigate(['/login']);
  }

  // --- MÉTODOS DE UTILIDAD INTERNA Y DE TOKEN ---

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  private saveToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  private updateAuthState(token: string): void {
    try {
      // jwt-decode devuelve un objeto con los claims del token
      // Comúnmente el username está en el claim 'sub' (subject)
      const decodedToken: { sub: string, [key: string]: any } = jwtDecode(token);
      
      this.loggedIn.next(true);
      this.currentUser.next(decodedToken.sub); // Asumimos que el username está en 'sub'
    } catch (error) {
      console.error("Error decodificando el token", error);
      this.logoutInternal();
    }
  }

  private logoutInternal(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.TOKEN_KEY);
    }
    this.loggedIn.next(false);
    this.currentUser.next(null);
  }
}