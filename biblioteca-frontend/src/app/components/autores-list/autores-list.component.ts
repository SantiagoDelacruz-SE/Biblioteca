// src/app/components/autores-list/autores-list.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AutorService, Autor } from '../../services/autor.service';
import { AuthService } from '../../services/auth.service'; // Importar AuthService
import { Observable } from 'rxjs';

@Component({
  selector: 'app-autores-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './autores-list.component.html',
  styleUrls: ['./autores-list.component.scss'] // Asumiendo que tienes un SCSS similar al de libros
})
export class AutoresListComponent implements OnInit {
  autores: Autor[] = [];
  cargando = true;
  errorAlCargar: string | null = null;
  errorAlModificar: string | null = null;

  mostrandoFormulario = false;
  nuevoAutor: Partial<Autor> = {
    nombre: '' // Ajustado a la interfaz simple de Autor
  };

  private autorService = inject(AutorService);
  private authService = inject(AuthService); // Inyectar AuthService
  isAdmin$: Observable<boolean> = this.authService.isAdmin$; // Exponer para la plantilla

  ngOnInit(): void {
    this.cargarAutores();
  }

  cargarAutores(): void {
    this.cargando = true;
    this.errorAlCargar = null;
    this.autorService.obtenerAutores().subscribe({
      next: (data) => {
        this.autores = data;
        this.cargando = false;
      },
      error: (err) => {
        this.errorAlCargar = 'No se pudieron cargar los autores.';
        this.cargando = false;
      }
    });
  }

  toggleFormularioAgregarAutor(): void {
    this.mostrandoFormulario = !this.mostrandoFormulario;
    this.errorAlModificar = null;
    if (this.mostrandoFormulario) {
      this.nuevoAutor = { nombre: '' };
    }
  }

  onSubmitNuevoAutor(form: NgForm): void {
    if (form.invalid) {
      this.errorAlModificar = 'Por favor, complete el nombre del autor.';
      Object.values(form.controls).forEach(control => control.markAsTouched());
      return;
    }
    this.errorAlModificar = null;
    const autorParaEnviar: Autor = {
      nombre: this.nuevoAutor.nombre!
    };
    this.autorService.crearAutor(autorParaEnviar).subscribe({
      next: (autorAgregado) => {
        this.autores.push(autorAgregado);
        this.toggleFormularioAgregarAutor();
        form.resetForm({ nombre: '' });
      },
      error: (err) => {
        this.errorAlModificar = 'Error al agregar el autor.';
      }
    });
  }

  solicitarEliminarAutor(idAutor: any): void {
    if (!idAutor) return;
    if (confirm(`¿Estás seguro de que quieres eliminar este autor?`)) {
      this.errorAlModificar = null;
      this.autorService.eliminarAutor(idAutor).subscribe({
        next: () => {
          this.autores = this.autores.filter(autor => autor.id !== idAutor);
        },
        error: (err) => {
          this.errorAlModificar = 'Error al eliminar el autor.';
        }
      });
    }
  }
}