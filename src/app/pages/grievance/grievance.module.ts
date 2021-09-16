import { NgModule } from '@angular/core';
import { ComponentsModule } from '../../components/components.module';
import {PopoverComponent} from '../../components/popover/popover.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GrievancePageRoutingModule } from './grievance-routing.module';
import { SignaturePadModule } from 'angular2-signaturepad';

import { GrievancePage } from './grievance.page';

@NgModule({
  entryComponents: [PopoverComponent],
  imports: [
    ComponentsModule,
    CommonModule,
    FormsModule,
    SignaturePadModule,
    IonicModule,
    GrievancePageRoutingModule
  ],
  declarations: [GrievancePage]
})
export class GrievancePageModule {}
