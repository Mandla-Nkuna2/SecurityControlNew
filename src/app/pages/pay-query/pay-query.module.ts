import { NgModule } from '@angular/core';
import { ComponentsModule } from '../../components/components.module';
import {PopoverComponent} from '../../components/popover/popover.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PayQueryPageRoutingModule } from './pay-query-routing.module';
import { SignaturePadModule } from 'angular2-signaturepad';

import { PayQueryPage } from './pay-query.page';

@NgModule({
  entryComponents: [PopoverComponent],
  imports: [
    ComponentsModule,
    CommonModule,
    SignaturePadModule,
    FormsModule,
    IonicModule,
    PayQueryPageRoutingModule
  ],
  declarations: [PayQueryPage]
})
export class PayQueryPageModule {}
