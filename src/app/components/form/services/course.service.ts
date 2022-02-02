import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { academicLevel } from '../interfaces/academic.levels.interface';
import { gradeOption } from '../interfaces/grade.options.interface';
import { Register } from '../interfaces/register.interface';
import { States, City } from '../interfaces/cities.interface';
import { Document } from '../interfaces/documento.interface';
import { BaseService, ErrorResponseString, Response_, SuccessResponseId } from './base.service';


@Injectable({
  providedIn: 'root'
})
export class CourseService extends BaseService {

  constructor(public http: HttpClient) {
    super(http)
   }

  getAcademicLevel():Promise<academicLevel[] | ErrorResponseString>{
    const smbUrl = `${this.baseUrl}academic-levels`
    return this.get<academicLevel[]>(smbUrl);

  }

  getGradeOption():Promise<gradeOption[] | ErrorResponseString>{
    const smbUrl = `${this.baseUrl}grade-options`
    return this.get<gradeOption[]>(smbUrl);
  }

  getState():Promise<States[] | ErrorResponseString>{
    const smbUrl = `${this.baseUrl}states`
    return this.get<States[]>(smbUrl);
  }

  async checkDocument(documentNumber: number): Promise<SuccessResponseId | ErrorResponseString> {
    return await this.validateField('document', documentNumber)
  }

  async checkEmail(email: string): Promise<SuccessResponseId | ErrorResponseString> {
    return await this.validateField('email', email)
  }

  async validateField(field: string, value: any) {
    try {
      const paramString = this.processUrlParams({
        field,
        value
      })
      const smbUrl = `${this.baseUrl}courses/validate-data${paramString}`
      return await this.get<SuccessResponseId>(smbUrl);
    } catch (error) {
      console.warn(error)
      if ((error as HttpErrorResponse).error) {
        return Promise.resolve((error as HttpErrorResponse).error)
      }
      return Promise.resolve({ data: (error as Error).message })
    }
  }


 async graduationRegister(register : Register): Promise<ErrorResponseString | SuccessResponseId>{
    const smbUrl = `${this.baseUrl}courses`
    return await this.post<SuccessResponseId, Register>(smbUrl, register);
  }

  async gratuationFile(id: number, file: File): Promise<any> {
    const smbUrl = `${this.baseUrl}courses/attached/${id}`
    let formData: FormData = new FormData();
    formData.append('files', file);
    let headers = new HttpHeaders();
    headers.append('Content-Type', 'multipart/form-data');
    headers.append('Accept', 'application/json');
    let options = {
      headers: headers
    };
    return await this.post<any, FormData>(smbUrl, formData, options)

  }

}
