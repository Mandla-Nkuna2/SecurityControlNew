import { NgModule } from '@angular/core';
import { ComponentsModule } from '../../components/components.module';
import {PopoverComponent} from '../../components/popover/popover.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { EmpPerformanceFormPage } from './emp-performance-form.page';
import { SignaturePadModule } from 'angular2-signaturepad';
import { IonicSelectableModule } from 'ionic-selectable'

const routes: Routes = [
  {
    path: '',
    component: EmpPerformanceFormPage
  }
];

@NgModule({
  entryComponents: [PopoverComponent],
  imports: [
    ComponentsModule,
    CommonModule,
    FormsModule,
    IonicModule,
    IonicSelectableModule,
    SignaturePadModule,
    RouterModule.forChild(routes)
  ],
  declarations: [EmpPerformanceFormPage]
})
export class EmpPerformanceFormPageModule {}
