import { NgModule } from '@angular/core';
import { ComponentsModule } from '../../components/components.module';
import {PopoverComponent} from '../../components/popover/popover.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FirePageRoutingModule } from './fire-routing.module';
import { SignaturePadModule } from 'angular2-signaturepad';

import { FirePage } from './fire.page';

@NgModule({
  entryComponents: [PopoverComponent],
  imports: [
    ComponentsModule,
    CommonModule,
    SignaturePadModule,
    FormsModule,
    IonicModule,
    FirePageRoutingModule
  ],
  declarations: [FirePage]
})
export class FirePageModule {}
