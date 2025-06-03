// src/app/services/libro.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// (Opcional pero recomendado) Define una interfaz para tus libros
export interface Libro {
  id?: any;
  titulo: string;
  autor_id?: number | null; // Para la selección en el formulario
  autor_nombre?: string;    // Para mostrar en la lista
  categoria_id?: number | null;
  categoria_nombre?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LibroService {
  private apiUrl = 'http://localhost:5000/api';

  private http = inject(HttpClient);

  obtenerLibros(): Observable<Libro[]> {
    return this.http.get<Libro[]>(`${this.apiUrl}/libros`);
  }

  obtenerLibroPorId(id: any): Observable<Libro> {
    return this.http.get<Libro>(`${this.apiUrl}/libros/${id}`);
  }

  crearLibro(libroData: Libro): Observable<Libro> {
    console.log('LibroService: creando libro con datos:', libroData);
    return this.http.post<Libro>(`${this.apiUrl}/libros`, libroData);
  }

  actualizarLibro(id: any, libroData: Libro): Observable<Libro> {
    return this.http.put<Libro>(`${this.apiUrl}/libros/${id}`, libroData);
  }

  eliminarLibro(idLibro: any): Observable<any> { // La respuesta puede ser vacía o un mensaje
    console.log(`LibroService: eliminando libro con ID: ${idLibro}`);
    return this.http.delete<any>(`${this.apiUrl}/libros/${idLibro}`);
  }
}