import { NgModule } from '@angular/core';
import { ComponentsModule } from '../../components/components.module';
import {PopoverComponent} from '../../components/popover/popover.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PolygraphPageRoutingModule } from './polygraph-routing.module';
import { SignaturePadModule } from 'angular2-signaturepad';

import { PolygraphPage } from './polygraph.page';

@NgModule({
  entryComponents: [PopoverComponent],
  imports: [
    ComponentsModule,
    CommonModule,
    SignaturePadModule,
    FormsModule,
    IonicModule,
    PolygraphPageRoutingModule
  ],
  declarations: [PolygraphPage]
})
export class PolygraphPageModule {}
