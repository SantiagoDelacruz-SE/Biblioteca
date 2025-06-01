// src/app/components/libros-list/libros-list.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { LibroService, Libro } from '../../services/libro.service';
import { AuthService } from '../../services/auth.service'; // Importar AuthService
import { Observable } from 'rxjs';

@Component({
  selector: 'app-libros-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './libros-list.component.html',
  styleUrls: ['./libros-list.component.scss']
})
export class LibrosListComponent implements OnInit {
  libros: Libro[] = [];
  cargando = true;
  errorAlCargar: string | null = null;
  errorAlModificar: string | null = null;

  mostrandoFormulario = false;
  nuevoLibro: Partial<Libro> = {
    titulo: '',
    autor_nombre: '' // Asegúrate que esto coincida con tu interfaz Libro y el form
  };

  private libroService = inject(LibroService);
  private authService = inject(AuthService); // Inyectar AuthService
  isAdmin$: Observable<boolean> = this.authService.isAdmin$; // Exponer para la plantilla

  ngOnInit(): void {
    this.cargarLibros();
  }

  cargarLibros(): void {
    this.cargando = true;
    this.errorAlCargar = null;
    this.libroService.obtenerLibros().subscribe({
      next: (data) => {
        this.libros = data;
        this.cargando = false;
      },
      error: (err) => {
        this.errorAlCargar = 'No se pudieron cargar los libros.';
        this.cargando = false;
      }
    });
  }

  toggleFormularioAgregarLibro(): void {
    this.mostrandoFormulario = !this.mostrandoFormulario;
    this.errorAlModificar = null;
    if (this.mostrandoFormulario) {
      this.nuevoLibro = { titulo: '', autor_nombre: '' };
    }
  }

  onSubmitNuevoLibro(form: NgForm): void {
    if (form.invalid) {
      this.errorAlModificar = 'Por favor, complete todos los campos requeridos.';
      Object.values(form.controls).forEach(control => control.markAsTouched());
      return;
    }
    this.errorAlModificar = null;
    const libroParaEnviar: Libro = {
      titulo: this.nuevoLibro.titulo!,
      autor_nombre: this.nuevoLibro.autor_nombre!
    };
    this.libroService.crearLibro(libroParaEnviar).subscribe({
      next: (libroAgregado) => {
        this.libros.push(libroAgregado);
        this.toggleFormularioAgregarLibro();
        form.resetForm({ titulo: '', autor_nombre: '' });
      },
      error: (err) => {
        this.errorAlModificar = 'Error al agregar el libro.';
      }
    });
  }

  solicitarEliminarLibro(idLibro: any): void {
    if (!idLibro) return;
    if (confirm(`¿Estás seguro de que quieres eliminar este libro?`)) {
      this.errorAlModificar = null;
      this.libroService.eliminarLibro(idLibro).subscribe({
        next: () => {
          this.libros = this.libros.filter(libro => libro.id !== idLibro);
        },
        error: (err) => {
          this.errorAlModificar = 'Error al eliminar el libro.';
        }
      });
    }
  }
}