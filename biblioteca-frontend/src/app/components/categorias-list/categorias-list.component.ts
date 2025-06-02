// src/app/components/categorias-list/categorias-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Categoria, CategoriaService } from '../../services/categoria.service'; // CategoriaService importado
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-categorias-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categorias-list.component.html',
  styleUrls: ['./categorias-list.component.scss']
})
export class CategoriasListComponent implements OnInit {
  categorias: Categoria[] = [];
  isAdmin$: Observable<boolean>;
  nuevaCategoriaNombre: string = '';
  mensaje: string = '';

  constructor(
    private categoriaService: CategoriaService, // Inyectado
    public authService: AuthService
  ) {
    this.isAdmin$ = this.authService.isAdmin$;
  }

  ngOnInit(): void {
    this.cargarCategorias();
  }

  cargarCategorias(): void {
    // Verifica que el nombre del método sea el correcto según tu CategoriaService
    this.categoriaService.obtenerCategorias().subscribe(
      (data: Categoria[]) => {         // <--- TIPO AÑADIDO para data
        this.categorias = data;
      },
      (error: any) => {                // <--- TIPO AÑADIDO para error
        console.error('Error al cargar categorías', error);
        this.mensaje = 'Error al cargar categorías.';
      }
    );
  }

  agregarCategoria(): void {
    if (!this.nuevaCategoriaNombre.trim()) {
      this.mensaje = 'El nombre de la categoría no puede estar vacío.';
      return;
    }
    const categoriaParaAgregar: Omit<Categoria, 'id'> = { nombre: this.nuevaCategoriaNombre };
    // Verifica que el nombre del método sea el correcto
    this.categoriaService.crearCategoria(categoriaParaAgregar).subscribe(
      () => {
        this.mensaje = 'Categoría agregada exitosamente.';
        this.nuevaCategoriaNombre = '';
        this.cargarCategorias();
        setTimeout(() => this.mensaje = '', 3000);
      },
      (error: any) => {                 // <--- TIPO AÑADIDO para error
        console.error('Error al agregar categoría', error);
        this.mensaje = 'Error al agregar la categoría. Verifique los permisos o intente más tarde.';
        setTimeout(() => this.mensaje = '', 5000);
      }
    );
  }

  eliminarCategoria(id?: number): void {
    if (id === undefined) {
      this.mensaje = 'ID de categoría inválido.';
      return;
    }
    if (confirm('¿Está seguro de que desea eliminar esta categoría?')) {
      // Verifica que el nombre del método sea el correcto
      this.categoriaService.eliminarCategoria(id).subscribe(
        () => {
          this.mensaje = 'Categoría eliminada exitosamente.';
          this.cargarCategorias();
          setTimeout(() => this.mensaje = '', 3000);
        },
        (error: any) => {               // <--- TIPO AÑADIDO para error
          console.error('Error al eliminar categoría', error);
          this.mensaje = 'Error al eliminar la categoría. Verifique los permisos o si está en uso.';
          setTimeout(() => this.mensaje = '', 5000);
        }
      );
    }
  }
}