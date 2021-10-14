import { NgModule } from '@angular/core';
import { ComponentsModule } from '../../components/components.module';
import {PopoverComponent} from '../../components/popover/popover.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ReportsPage } from './reports.page';
import { IonicSelectableModule } from 'ionic-selectable'

const routes: Routes = [
  {
    path: '',
    component: ReportsPage
  }
];

@NgModule({
  entryComponents: [PopoverComponent],
  imports: [
    ComponentsModule,
    IonicSelectableModule,
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ReportsPage]
})
export class ReportsPageModule {}
