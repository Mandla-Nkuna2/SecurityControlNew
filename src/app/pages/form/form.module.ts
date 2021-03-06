import { NgModule } from '@angular/core';
import { ComponentsModule } from '../../components/components.module';
import { PopoverComponent } from '../../components/popover/popover.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { Form } from './form.page';
const routes: Routes = [
  {
    path: '',
    component: Form
  }
];

@NgModule({
  entryComponents: [PopoverComponent, Form],
  imports: [
    ComponentsModule,
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
  ],
  declarations: [Form],
})
export class FormsPageModule { }
