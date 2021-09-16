import { NgModule } from '@angular/core';
import { ComponentsModule } from '../../components/components.module';
import {PopoverComponent} from '../../components/popover/popover.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ExtinguisherChecklistPageRoutingModule } from './extinguisher-checklist-routing.module';
import { SignaturePadModule } from 'angular2-signaturepad';

import { ExtinguisherChecklistPage } from './extinguisher-checklist.page';

@NgModule({
  entryComponents: [PopoverComponent],
  imports: [
    ComponentsModule,
    CommonModule,
    SignaturePadModule,
    FormsModule,
    IonicModule,
    ExtinguisherChecklistPageRoutingModule
  ],
  declarations: [ExtinguisherChecklistPage]
})
export class ExtinguisherChecklistPageModule {}
