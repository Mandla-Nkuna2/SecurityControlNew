import { NgModule } from '@angular/core';
import { ComponentsModule } from '../../components/components.module';
import {PopoverComponent} from '../../components/popover/popover.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GasExplosionPageRoutingModule } from './gas-explosion-routing.module';
import { SignaturePadModule } from 'angular2-signaturepad';

import { GasExplosionPage } from './gas-explosion.page';

@NgModule({
  entryComponents: [PopoverComponent],
  imports: [
    ComponentsModule,
    CommonModule,
    SignaturePadModule,
    FormsModule,
    IonicModule,
    GasExplosionPageRoutingModule
  ],
  declarations: [GasExplosionPage]
})
export class GasExplosionPageModule {}
