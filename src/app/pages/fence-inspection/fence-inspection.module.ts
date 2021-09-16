import { NgModule } from '@angular/core';
import { ComponentsModule } from '../../components/components.module';
import {PopoverComponent} from '../../components/popover/popover.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FenceInspectionPageRoutingModule } from './fence-inspection-routing.module';

import { FenceInspectionPage } from './fence-inspection.page';
import { SignaturePadModule } from 'angular2-signaturepad';

@NgModule({
  entryComponents: [PopoverComponent],
  imports: [
    ComponentsModule,
    CommonModule,
    SignaturePadModule,
    FormsModule,
    IonicModule,
    FenceInspectionPageRoutingModule
  ],
  declarations: [FenceInspectionPage]
})
export class FenceInspectionPageModule {}
