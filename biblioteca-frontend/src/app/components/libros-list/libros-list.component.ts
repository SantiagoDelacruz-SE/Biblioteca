// src/app/components/libros-list/libros-list.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { LibroService, Libro } from '../../services/libro.service';
import { AutorService, Autor } from '../../services/autor.service';
import { Categoria, CategoriaService } from '../../services/categoria.service';
import { AuthService } from '../../services/auth.service';
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
  todosLosAutores: Autor[] = []; // Para el dropdown de autores
  todasLasCategorias: Categoria[] = []; // Para el dropdown de categorías

  cargando = true;
  cargandoDependencias = true; // Para autores y categorías
  errorAlCargar: string | null = null;
  errorAlModificar: string | null = null;

  mostrandoFormulario = false;
  nuevoLibro: Partial<Libro> = { // Usamos Partial porque no todos los campos son para creación directa (ej. id, autor_nombre)
    titulo: '',
    autor_id: null,
    categoria_id: null
  };

  private libroService = inject(LibroService);
  private autorService = inject(AutorService);
  private categoriaService = inject(CategoriaService); // Si lo implementas
  private authService = inject(AuthService);
  isAdmin$: Observable<boolean> = this.authService.isAdmin$;

  ngOnInit(): void {
    this.cargarLibros();
    this.cargarDependenciasParaFormulario();
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

  cargarDependenciasParaFormulario(): void {
    this.cargandoDependencias = true;
    // Cargar autores
    this.autorService.obtenerAutores().subscribe({
      next: (autores) => {
        this.todosLosAutores = autores;
        this.cargandoDependencias = false; 
      },
      error: (err) => {
        console.error('Error al cargar autores (y/o categorías):', err);
        this.errorAlModificar = 'No se pudieron cargar datos para el formulario (autores/categorías).';
        this.cargandoDependencias = false;
      }
    });
    // Cargar categorías
    this.categoriaService.obtenerCategorias().subscribe({
      next: (categorias) => {
        this.todasLasCategorias = categorias;
        // Podrías poner cargandoDependencias a false solo cuando ambas cargas terminen si es necesario.
        // Por simplicidad, si la carga de autores ya lo hace, puede ser suficiente.
      },
      error: (err) => {
        console.error('Error al cargar categorías:', err);
        this.errorAlModificar = (this.errorAlModificar || '') + ' No se pudieron cargar las categorías.';
        // this.cargandoDependencias = false; // Considera el estado de la carga de autores
      }
    });
  }

  toggleFormularioAgregarLibro(): void {
    this.mostrandoFormulario = !this.mostrandoFormulario;
    this.errorAlModificar = null;
    if (this.mostrandoFormulario) {
      this.nuevoLibro = { // Resetea al abrir
        titulo: '',
        autor_id: null,
        categoria_id: null
      };
      if (this.todosLosAutores.length === 0 /* || this.todasLasCategorias.length === 0 */) {
        this.cargarDependenciasParaFormulario(); // Carga si no están disponibles
      }
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
      autor_id: this.nuevoLibro.autor_id ? Number(this.nuevoLibro.autor_id) : null,
      categoria_id: this.nuevoLibro.categoria_id ? Number(this.nuevoLibro.categoria_id) : null
    };

    this.libroService.crearLibro(libroParaEnviar).subscribe({
      next: (libroAgregadoConDetalles) => { // Asumimos que el backend devuelve el libro con nombres de autor/categoría
        // this.libros.push(libroAgregadoConDetalles); // Opción 1: Añadir localmente
        this.cargarLibros(); // Opción 2: Recargar toda la lista para asegurar consistencia
        this.toggleFormularioAgregarLibro();
        form.resetForm({
          titulo: '', autor_id: null, categoria_id: null, isbn: '', anio_publicacion: undefined
        });
      },
      error: (err) => {
        console.error('Error al agregar libro:', err);
        this.errorAlModificar = err.error?.error || 'Error al agregar el libro. Verifique los datos.';
      }
    });
  }

  solicitarEliminarLibro(idLibro: any): void {
    if (!idLibro) return;
    if (confirm(`¿Estás seguro de que quieres eliminar este libro?`)) {
      this.errorAlModificar = null;
      this.libroService.eliminarLibro(idLibro).subscribe({
        next: (response) => {
          console.log(response.message); // Mensaje del backend
          this.libros = this.libros.filter(libro => libro.id !== idLibro);
        },
        error: (err) => {
          this.errorAlModificar = 'Error al eliminar el libro.';
        }
      });
    }
  }
}