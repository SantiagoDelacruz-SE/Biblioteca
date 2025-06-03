import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LibrosListComponent } from './components/libros-list/libros-list.component';
import { AutoresListComponent } from './components/autores-list/autores-list.component';
import { LoginComponent } from './components/login/login.component';
import { CategoriasListComponent } from './components/categorias-list/categorias-list.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Inicio - Biblioteca' },
  { path: 'libros', component: LibrosListComponent, title: 'Libros - Biblioteca' },
  { path: 'autores', component: AutoresListComponent, title: 'Autores - Biblioteca' },
  { path: 'login', component: LoginComponent, title: 'Iniciar Sesión - Admin' },
  { path: 'categorias', component: CategoriasListComponent, title: 'Categorias - Biblioteca' },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];