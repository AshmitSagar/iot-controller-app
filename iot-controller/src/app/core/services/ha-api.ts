import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class HaApiService {
  private baseUrl: string = '';

  constructor(private http: HttpClient) {}

  setBaseUrl(url: string): void {
    this.baseUrl = `${url}/api`;
  }

  getStates(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/states`).pipe(
      catchError(this.handleError)
    );
  }

  getState(entityId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/states/${entityId}`).pipe(
      catchError(this.handleError)
    );
  }

  callService(
    domain: string,
    service: string,
    data: any
  ): Observable<any> {
    return this.http
      .post(`${this.baseUrl}/services/${domain}/${service}`, data)
      .pipe(catchError(this.handleError));
  }

  getConfig(): Observable<any> {
    return this.http.get(`${this.baseUrl}/config`).pipe(
      catchError(this.handleError)
    );
  }

  getServices(): Observable<any> {
    return this.http.get(`${this.baseUrl}/services`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
