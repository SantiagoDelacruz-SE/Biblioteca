// src/app/services/autor.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Autor {
  id?: any; // El ID puede ser asignado por el backend y es de tipo 'any'
  nombre: string;
}

@Injectable({
  providedIn: 'root'
})
export class AutorService {
  private apiUrl = 'http://localhost:5000/api';

  private http = inject(HttpClient);

  obtenerAutores(): Observable<Autor[]> {
    return this.http.get<Autor[]>(`${this.apiUrl}/autores`);
  }

  obtenerAutorPorId(id: any): Observable<Autor> {
    return this.http.get<Autor>(`<span class="math-inline">\{this\.apiUrl\}/autores/</span>{id}`);
  }

  crearAutor(autorData: Autor): Observable<Autor> {
    console.log('AutorService: creando autor con datos:', autorData);
    return this.http.post<Autor>(`${this.apiUrl}/autores`, autorData);
  }

  actualizarAutor(id: any, autorData: Autor): Observable<Autor> {
    return this.http.put<Autor>(`<span class="math-inline">\{this\.apiUrl\}/autores/</span>{id}`, autorData);
  }

  eliminarAutor(idAutor: any): Observable<any> {
    console.log(`AutorService: eliminando autor con ID: ${idAutor}`);
    return this.http.delete<any>(`<span class="math-inline">\{this\.apiUrl\}/autores/</span>{idAutor}`);
  }
}