// src/app/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { KeycloakService, KeycloakEventType } from 'keycloak-angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, shareReplay, distinctUntilChanged } from 'rxjs/operators';


export interface UserProfile {
  id?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  emailVerified?: boolean;
  
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private keycloakService = inject(KeycloakService);
  private router = inject(Router);

  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  private userProfileSubject = new BehaviorSubject<UserProfile | null>(null);
  private userRolesSubject = new BehaviorSubject<string[]>([]);

  // Observables públicos para que los componentes se suscriban
  public readonly isLoggedIn$: Observable<boolean> = this.isLoggedInSubject.asObservable().pipe(
    distinctUntilChanged(), // Solo emite si el valor ha cambiado
    shareReplay(1)          // Cachea el último valor y lo reemite a nuevos suscriptores
  );
  public readonly userProfile$: Observable<UserProfile | null> = this.userProfileSubject.asObservable().pipe(
    shareReplay(1)
  );
  public readonly userRoles$: Observable<string[]> = this.userRolesSubject.asObservable().pipe(
    shareReplay(1)
  );
  public readonly isAdmin$: Observable<boolean>;

  constructor() {
  this.keycloakService.keycloakEvents$.subscribe(async (event) => {
    console.log('Keycloak Event:', event);

    
    const eventTypeString = event.type as unknown as string; 
    
    if (
      eventTypeString === "Ready" ||
      eventTypeString === "AuthSuccess" ||
      eventTypeString === "AuthLogout" ||
      eventTypeString === "TokenExpired" 
    ) {
      await this.updateAuthStateSubjects();
    }
  });

  this.isAdmin$ = this.userRoles$.pipe(
    map(roles => roles.includes('realm-admin')),
    shareReplay(1)
  );

  this.updateAuthStateSubjectsWhenReady();
}

  
  private async updateAuthStateSubjectsWhenReady(): Promise<void> {
    try {
      
      await this.keycloakService.isLoggedIn(); 
      await this.updateAuthStateSubjects();
    } catch (error) {
      console.warn("AuthService: Could not perform initial auth state update, waiting for Keycloak events.", error);
      this.isLoggedInSubject.next(false);
      this.userProfileSubject.next(null);
      this.userRolesSubject.next([]);
    }
  }

  
  private async updateAuthStateSubjects(): Promise<void> {
    try {
      const isLoggedIn = await this.keycloakService.isLoggedIn();
      this.isLoggedInSubject.next(isLoggedIn);

      if (isLoggedIn) {
        const userProfile = await this.keycloakService.loadUserProfile();
        this.userProfileSubject.next(userProfile as UserProfile); 
        const roles = this.keycloakService.getUserRoles(true); 
        console.log('AuthService - Roles recibidos de Keycloak:', roles);
        this.userRolesSubject.next(roles);
        console.log('AuthService: User is logged in. Profile:', userProfile, 'Roles:', roles);
      } else {
        this.userProfileSubject.next(null);
        this.userRolesSubject.next([]);
        console.log('AuthService: User is not logged in.');
      }
    } catch (error) {
        console.error("AuthService: Error updating auth state subjects from Keycloak:", error);
        // En caso de error, reseteamos a un estado no autenticado
        this.isLoggedInSubject.next(false);
        this.userProfileSubject.next(null);
        this.userRolesSubject.next([]);
    }
  }

  /**
   * Inicia el flujo de login con Keycloak.
   */
  async login(): Promise<void> {
    try {
      await this.keycloakService.login({
        // Opcional: puedes especificar la URI de redirección después del login
        // Por ejemplo, para volver a la página actual o a una específica:
        // redirectUri: window.location.href
        // redirectUri: window.location.origin + '/libros'
      });
    } catch (error) {
      console.error('AuthService: Failed to initiate login sequence', error);
    }
  }

  
  async logout(): Promise<void> {
    try {
      await this.keycloakService.logout(window.location.origin); 
    } catch (error) {
      console.error('AuthService: Failed to initiate logout sequence', error);
    }
  }
}