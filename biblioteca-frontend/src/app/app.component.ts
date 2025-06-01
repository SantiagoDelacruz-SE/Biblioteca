// src/app/app.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService, UserProfile } from './services/auth.service'; // Importar AuthService y UserProfile
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'LibrisNet'; // O 'Mi Biblioteca'
  anioActual = new Date().getFullYear();

  private authService = inject(AuthService);

  isLoggedIn$: Observable<boolean>;
  isAdmin$: Observable<boolean>;
  userProfile$: Observable<UserProfile | null>;

  constructor() {
    this.isLoggedIn$ = this.authService.isLoggedIn$;
    this.isAdmin$ = this.authService.isAdmin$;
    this.userProfile$ = this.authService.userProfile$;
  }

  ngOnInit(): void {
    // El AuthService ya se encarga de inicializar y observar el estado
    this.userProfile$.subscribe(profile => {
      if (profile) {
        console.log('Perfil de usuario en AppComponent:', profile);
      }
    });
    this.authService.userRoles$.subscribe(roles => {
      console.log('Roles en AppComponent:', roles);
    });
  }

  login(): void {
    this.authService.login();
  }

  logout(): void {
    this.authService.logout();
  }
}