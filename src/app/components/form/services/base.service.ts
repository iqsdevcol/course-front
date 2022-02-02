import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface ApiResponse<T> {
  data: T
}

export type SuccessResponseId = ApiResponse<number>
export type ErrorResponseString = ApiResponse<string>
export type Response_ = SuccessResponseId | ErrorResponseString | null

@Injectable({
  providedIn: 'root'
})
export class BaseService {
  public baseUrl = environment.apiUrl;

  constructor(public http: HttpClient) { }

  public processException(err: any) {
    if (err.error) {
      err = err.error;
    }

    if (err.data) {
      err = err.data
    }

    return { data: err } as ApiResponse<string>;
  }

  public processUrlParams(params: any) {
    let str_ = ''
    const p_ = Object.keys(params).filter(it => ![null, ''].includes(params[it])).map(it => `${it}=${params[it]}`)
    str_ = p_.join('&')
    return str_.length > 0 ? `?${str_}` : ''
  }

  public get<T>(url: string): Promise<T | ErrorResponseString> {
    return this.http.get<T | ErrorResponseString>(url).toPromise();
  }

  public async post<T, S>(url: string, payload: S, options: {} = {}): Promise<T | ErrorResponseString> {
    return await this.http.post<T | ErrorResponseString>(url, payload, options).toPromise();
  }

  public async put<T, S>(url: string, payload: S): Promise<T | ErrorResponseString> {
    return await this.http.put<T | ErrorResponseString>(url, payload).toPromise();
  }

  public async patch<T, S>(url: string, payload: S): Promise<T | ErrorResponseString> {
    return await this.http.patch<T | ErrorResponseString>(url, payload).toPromise();
  }

  public async delete<T, S>(url: string, payload: S): Promise<T | ErrorResponseString> {
    return await this.http.delete<T | ErrorResponseString>(url, payload).toPromise();
  }
}