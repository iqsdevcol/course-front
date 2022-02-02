import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormComponent } from './components/form/form.component';
import { ThanksComponent } from './components/thanks/thanks.component';

const routes: Routes = [
  { path: 'register', component: FormComponent },
  { path: 'exit', component: ThanksComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
