// src/app/services/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { KeycloakService, KeycloakEventType } from 'keycloak-angular'; // Asegúrate que KeycloakEventType esté importado
import { BehaviorSubject, Observable } from 'rxjs';
import { map, shareReplay, distinctUntilChanged } from 'rxjs/operators';

// (Opcional pero recomendado) Interfaz para el perfil de usuario de Keycloak
export interface UserProfile {
  id?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  emailVerified?: boolean;
  // Puedes añadir más campos si los necesitas de Keycloak, ej: attributes?: Record<string, unknown>;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private keycloakService = inject(KeycloakService);
  private router = inject(Router);

  // BehaviorSubjects para el estado interno y para emitir cambios
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

    // 1. ASEGÚRATE DE TENER ESTA LÍNEA ANTES DEL IF:
    const eventTypeString = event.type as unknown as string; // <--- CAMBIO AQUÍ
    // 2. ASEGÚRATE DE QUE TODAS LAS COMPARACIONES EN EL IF USEN eventTypeString:
    if (
      eventTypeString === "Ready" ||
      eventTypeString === "AuthSuccess" ||
      eventTypeString === "AuthLogout" ||
      eventTypeString === "TokenExpired" // <-- Verifica que aquí también uses eventTypeString
    ) {
      await this.updateAuthStateSubjects();
    }
  });

  // Derivar isAdmin$ de userRoles$
  this.isAdmin$ = this.userRoles$.pipe(
    map(roles => roles.includes('admin')),
    shareReplay(1)
  );

  this.updateAuthStateSubjectsWhenReady();
}

  /**
   * Intenta actualizar el estado de autenticación. Se llama en el constructor.
   * El evento OnReady de Keycloak es el principal responsable de la actualización inicial fiable.
   */
  private async updateAuthStateSubjectsWhenReady(): Promise<void> {
    try {
      // Esta llamada es para asegurar que no intentamos acceder a métodos de Keycloak
      // antes de que 'init' haya tenido la oportunidad de ejecutarse (aunque APP_INITIALIZER lo maneja).
      // No es estrictamente necesario si se confía plenamente en el evento OnReady.
      await this.keycloakService.isLoggedIn(); 
      await this.updateAuthStateSubjects();
    } catch (error) {
      // Este error podría ocurrir si Keycloak no está accesible durante el arranque inicial
      // antes de que el evento OnReady se dispare.
      console.warn("AuthService: Could not perform initial auth state update, waiting for Keycloak events.", error);
      this.isLoggedInSubject.next(false);
      this.userProfileSubject.next(null);
      this.userRolesSubject.next([]);
    }
  }

  /**
   * Actualiza los BehaviorSubjects internos basados en el estado actual de KeycloakService.
   */
  private async updateAuthStateSubjects(): Promise<void> {
    try {
      const isLoggedIn = await this.keycloakService.isLoggedIn();
      this.isLoggedInSubject.next(isLoggedIn);

      if (isLoggedIn) {
        const userProfile = await this.keycloakService.loadUserProfile();
        this.userProfileSubject.next(userProfile as UserProfile); // Casting a nuestra interfaz
        const roles = this.keycloakService.getUserRoles(true); // true para obtener roles de todos los clientes asignados
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

  /**
   * Cierra la sesión del usuario en Keycloak y en la aplicación.
   */
  async logout(): Promise<void> {
    try {
      await this.keycloakService.logout(window.location.origin); // Redirige a la raíz de tu app después del logout
      // Los BehaviorSubjects se actualizarán a través del evento OnAuthLogout que dispara updateAuthStateSubjects
    } catch (error) {
      console.error('AuthService: Failed to initiate logout sequence', error);
    }
  }
}