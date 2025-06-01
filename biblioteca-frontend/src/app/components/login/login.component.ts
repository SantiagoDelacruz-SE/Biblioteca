// src/app/components/login/login.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router'; // Import Router

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule], // Ya no necesitamos FormsModule aquí
  template: `
    <div class="login-redirect-message">
      <p>Redirigiendo a la página de inicio de sesión...</p>
      <p *ngIf="showError">No se pudo iniciar la redirección. Inténtelo desde la barra de navegación.</p>
    </div>
  `,
  styles: [`
    .login-redirect-message {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 50vh;
      text-align: center;
    }
  `]
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router); // Inyectar Router
  public showError = false;

  async ngOnInit(): Promise<void> {
    // Si el usuario ya está logueado, quizás redirigirlo a otra parte o mostrar un mensaje
    const isLoggedIn = await this.authService.isLoggedIn$.toPromise(); // Convertir Observable a Promise para un chequeo único
    if (isLoggedIn) {
      this.router.navigate(['/']); // Redirigir al inicio si ya está logueado
      return;
    }

    // Iniciar el login de Keycloak
    try {
      await this.authService.login();
      // La redirección a Keycloak ocurrirá aquí. Si falla o el usuario vuelve sin loguearse,
      // la app se recargará y el estado se determinará por APP_INITIALIZER y AuthService.
    } catch (error) {
      console.error('Error al intentar iniciar login con Keycloak desde LoginComponent:', error);
      this.showError = true;
    }
  }
}