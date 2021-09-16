import { NgModule } from '@angular/core';
import { ComponentsModule } from '../../components/components.module';
import {PopoverComponent} from '../../components/popover/popover.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { SignaturePadModule } from 'angular2-signaturepad';

import { PerformanceAppraisalPageRoutingModule } from './performance-appraisal-routing.module';

import { PerformanceAppraisalPage } from './performance-appraisal.page';

@NgModule({
  entryComponents: [PopoverComponent],
  imports: [
    ComponentsModule,
    CommonModule,
    SignaturePadModule,
    FormsModule,
    IonicModule,
    PerformanceAppraisalPageRoutingModule
  ],
  declarations: [PerformanceAppraisalPage]
})
export class PerformanceAppraisalPageModule {}
