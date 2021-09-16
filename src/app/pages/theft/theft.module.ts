import { NgModule } from '@angular/core';
import { ComponentsModule } from '../../components/components.module';
import {PopoverComponent} from '../../components/popover/popover.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TheftPageRoutingModule } from './theft-routing.module';
import { SignaturePadModule } from 'angular2-signaturepad';

import { TheftPage } from './theft.page';

@NgModule({
  entryComponents: [PopoverComponent],
  imports: [
    ComponentsModule,
    CommonModule,
    SignaturePadModule,
    FormsModule,
    IonicModule,
    TheftPageRoutingModule
  ],
  declarations: [TheftPage]
})
export class TheftPageModule {}
