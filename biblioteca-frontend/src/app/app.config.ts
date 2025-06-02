// src/app/app.config.ts
import { ApplicationConfig, APP_INITIALIZER, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes'; // Tus rutas
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

// Imports de Keycloak
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';

// Función para inicializar Keycloak
function initializeKeycloak(keycloak: KeycloakService) {
  return () =>
    keycloak.init({
      config: {
        url: 'http://localhost:8080', 
        realm: 'biblioteca-realm',
        clientId: 'biblioteca-frontend-client'
      },
      initOptions: {
        onLoad: 'login-required', // 'login-required' para forzar login; 'check-sso' para verificar si ya hay sesión
        silentCheckSsoRedirectUri:
          window.location.origin + '/assets/silent-check-sso.html'
      },
      // Habilita el interceptor de Bearer por defecto para añadir el token a las peticiones HTTP.
      // Excluye rutas que no necesiten el token (ej. assets o APIs públicas).
      // Si todas tus APIs (libros, autores) están protegidas, no necesitas excluir mucho.
      bearerExcludedUrls: ['/assets']
    });
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),

    // Proveedores de Keycloak
    importProvidersFrom(KeycloakAngularModule), // Necesario para directivas y pipes de keycloak-angular
    KeycloakService, // El servicio principal
    {
      provide: APP_INITIALIZER, // Asegura que Keycloak se inicialice antes de que la app arranque
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService] // KeycloakService se inyecta en initializeKeycloak
    }
  ]
};