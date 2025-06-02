// src/app/services/categoria.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';


export interface Categoria {
  id?: any;
  nombre: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private apiUrl = 'http://localhost:5000/api';

  private http = inject(HttpClient);
  
  obtenerCategorias(): Observable<Categoria[]> {

    return this.http.get<Categoria[]>(`${this.apiUrl}/categorias`).pipe(
      tap(_ => console.log('Categorías obtenidas')),
      catchError(this.handleError<Categoria[]>('obtenerCategorias', []))
    );
  }

  obtenerCategoriaPorId(id: any): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.apiUrl}/categorias/${id}`).pipe(
      tap(_ => console.log(`Categoría obtenida id=${id}`)),
      catchError(this.handleError<Categoria>(`obtenerCategoriaPorId id=${id}`))
    );
  }

  crearCategoria(categoriaData: Omit<Categoria, 'id'>): Observable<Categoria> {
    console.log('CategoriaService: creando categoría con datos:', categoriaData);
    // El interceptor de Keycloak debería añadir el token.
    return this.http.post<Categoria>(`${this.apiUrl}/categorias`, categoriaData).pipe(
      tap((nuevaCategoria: Categoria) => console.log(`Categoría creada con id=${nuevaCategoria.id}`)),
      catchError(this.handleError<Categoria>('crearCategoria'))
    );
  }

  actualizarCategoria(id: any, categoriaData: Categoria): Observable<Categoria> {
    console.log(`CategoriaService: actualizando categoría ID: ${id} con datos:`, categoriaData);
    return this.http.put<Categoria>(`${this.apiUrl}/categorias/${id}`, categoriaData).pipe(
      tap(_ => console.log(`Categoría actualizada id=${id}`)),
      catchError(this.handleError<Categoria>('actualizarCategoria'))
    );
  }

  eliminarCategoria(idCategoria: any): Observable<any> {
    console.log(`CategoriaService: eliminando categoría con ID: ${idCategoria}`);
    return this.http.delete<any>(`${this.apiUrl}/categorias/${idCategoria}`).pipe(
      tap(_ => console.log(`Categoría eliminada id=${idCategoria}`)),
      catchError(this.handleError<any>('eliminarCategoria'))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} falló: ${error.message || JSON.stringify(error)}`);
      if (error.status === 401 || error.status === 403) {
        console.error('Error de autenticación/autorización recibido del backend.');
      }
      return of(result as T);
    };
  }
}