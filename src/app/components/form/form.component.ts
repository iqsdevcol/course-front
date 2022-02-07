import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, Validators, FormBuilder, AbstractControl, AsyncValidatorFn, } from '@angular/forms';
import { CourseService } from './services/course.service';
import { debounceTime, finalize, map, switchMap, tap} from 'rxjs/operators';
import { academicLevel } from './interfaces/academic.levels.interface';
import { gradeOption } from './interfaces/grade.options.interface';
import { Register } from './interfaces/register.interface';
import { City, States } from './interfaces/cities.interface';
import {fromEvent, of, pipe} from 'rxjs';
import { ErrorResponseString } from './services/base.service';
import { ThousandsPipe } from '../pipes/thousands.pipe';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { formatCurrency, getCurrencySymbol } from '@angular/common';
import * as angular from "angular";
@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {

  submitted: any = false;
  file: any;
  

  form = new FormGroup ({
    documentCityId: new FormControl(null, [Validators.required, Validators.pattern('[0-9]{1,10}')]),
    document: new FormControl('', {
      validators: [Validators.required, Validators.pattern('[0-9]{5,10}')],
      updateOn: 'blur'
    }),
    name:  new FormControl('', [Validators.required, Validators.pattern('[A-Za-zäÄëËïÏöÖüÜáéíóúáéíóúÁÉÍÓÚÂÊÎÔÛâêîôûàèìòùÀÈÌÒÙÑñ]*')]),
    middleName: new FormControl('', [Validators.pattern('[A-Za-zäÄëËïÏöÖüÜáéíóúáéíóúÁÉÍÓÚÂÊÎÔÛâêîôûàèìòùÀÈÌÒÙÑñ]*')]),
    lastname: new FormControl('', [Validators.required, Validators.pattern('[A-Za-zäÄëËïÏöÖüÜáéíóúáéíóúÁÉÍÓÚÂÊÎÔÛâêîôûàèìòùÀÈÌÒÙÑñ]*')]),
    secondLastname: new FormControl('', [Validators.pattern('[A-Za-zäÄëËïÏöÖüÜáéíóúáéíóúÁÉÍÓÚÂÊÎÔÛâêîôûàèìòùÀÈÌÒÙÑñ]*')]),
    email: new FormControl('', {
      validators: [Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$')],
      updateOn: 'blur'
    }),
    cellphone: new FormControl('', [Validators.required, Validators.pattern('[3][0-9]{9}')]),
    documentDate: new FormControl('', Validators.required),
    academicLevelId: new FormControl(null, Validators.required),
    gradeOptionLevelId: new FormControl(null, Validators.required),
    paymentValue: new FormControl('', [Validators.required,Validators.pattern('[1-9]{3,15}')]),
    paymentDate: new FormControl('', Validators.required),
    departament: new FormControl(null, Validators.required),
    paymentDoc: new FormControl('', Validators.required),
    paymentList: new FormControl('', Validators.required),
  })

  fileName = ""
  academicLevels: academicLevel[] = [];
  gradeOptions: gradeOption[] = [];
  states: States[] = [];
  cities: City[] = [];
  maxDate: string = '1995-01-01';
  currencyValue = '';
  selection: any;
  requiredState = '';



  constructor(private courseSvc: CourseService, public modal: NgbModal ) { }

  ngOnInit(): void {
    
  

    let dtToday = new Date();
    let month = (dtToday.getMonth() + 1).toString();
    let day = dtToday.getDate().toString();
    let year = dtToday.getFullYear();
    if(parseInt(month) < 10)
        month = '0' + month.toString();
    if(parseInt(day) < 10)
        day = '0' + day.toString();
    
    this.maxDate = year + '-' + month + '-' + day;

    this.courseSvc.getAcademicLevel()
    .then(
      (academicLevels) => {
        if ((academicLevels as ErrorResponseString).data) {
          console.error((academicLevels as ErrorResponseString).data)
          return
        }
        this.academicLevels = (academicLevels as academicLevel[])
      }
    )
    this.courseSvc.getGradeOption()
    .then(
      (gradeOptions) => {
        if ((gradeOptions as ErrorResponseString).data) {
          console.error((gradeOptions as ErrorResponseString).data)
          return
        }
        this.gradeOptions = (gradeOptions as gradeOption[])
      }
    )
    this.courseSvc.getState()
    .then(
      (states) => {
        if ((states as ErrorResponseString).data) {
          console.error((states as ErrorResponseString).data)
          return
        }
        this.states = (states as States[])
      }
    )

    this.form.controls.departament.valueChanges.subscribe(it => {
      this.cities = this.states.find(state => state.id == it)!.cities
    })
    this.form.controls.document.valueChanges.subscribe(async (it) => {
      const response = await this.courseSvc.checkDocument(it)
      if (response?.data) {
        this.form.controls.document.setErrors({ 'alreadyExists': response?.data })
      }
    })


    this.form.controls.email.valueChanges.subscribe(async (it) => {
      const response = await this.courseSvc.checkEmail(it)
      if (response?.data) {
        this.form.controls.email.setErrors({ 'alreadyExists': response?.data })
      }

    })
  }

  updateValue(value: string) {
    let val = parseInt(value, 10);
    if (Number.isNaN(val)) {
      val = 0;
    }
    this.currencyValue = formatCurrency(val, 'es-CO', getCurrencySymbol('COP', 'wide'));
}

  get personalData(){
    return (this.form as FormGroup).controls;
  }


  async onSubmit() {
    this.submitted = true;
    if(this.form.valid) {
      const form_ = this.form.value;
      delete form_.paymentDoc
      const response = await this.courseSvc.graduationRegister(this.form.value)
      await this.courseSvc.gratuationFile(response?.data as number, this.file)
      window.location.href = '/exit'
    }
  }

  onChange(event: any) {
    let fileList: FileList = event.target.files;
    if(fileList.length > 0) {
        this.file = fileList[0];
    }
  }

  showInput() {
    let a = (<HTMLInputElement>document.getElementById("paymentList")).value;
    let b = (<HTMLInputElement>document.getElementById("paymentValue"));
    
   
    if (a == "0") {
      (<HTMLInputElement>document.getElementById("pay")).hidden = false;
      b.value = '';
      this.form.get('paymentValue')!.setValidators([Validators.required, Validators.pattern('[1-9]{3,15}')]);
      this.form.get('paymentValue')!.updateValueAndValidity();

    } else {
      (<HTMLInputElement>document.getElementById("pay")).hidden= true;
      b.value = a;
      this.form.get('paymentValue')!.clearValidators();
      this.form.get('paymentValue')!.updateValueAndValidity();

    }

  }

 ponerPuntos() {

  let campo = (<HTMLInputElement>document.getElementById("paymentValue"));
    let valor:any = campo.value;
    let num = ""
    if (valor != "" && valor != null) {
      valor = valor.replace(/\./g, '')
      valor = valor.replace(/\./g, '')
      valor = valor.replace(/[^0-9]/g, '')
      if (valor != "" && valor != null) {
        num = Math.ceil(valor).toString().split('').reverse().join('').replace(/(?=\d*\.?)(\d{3})/g, '$1.');
        num = num.split('').reverse().join('').replace(/^[\.]/, '');
      }
    }
    campo.value = num;
  }

  
}

