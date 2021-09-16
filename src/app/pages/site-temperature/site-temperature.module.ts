import { NgModule } from '@angular/core';
import { ComponentsModule } from '../../components/components.module';
import {PopoverComponent} from '../../components/popover/popover.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SiteTemperaturePageRoutingModule } from './site-temperature-routing.module';

import { SiteTemperaturePage } from './site-temperature.page';

@NgModule({
  entryComponents: [PopoverComponent],
  imports: [
    ComponentsModule,
    CommonModule,
    FormsModule,
    IonicModule,
    SiteTemperaturePageRoutingModule
  ],
  declarations: [SiteTemperaturePage]
})
export class SiteTemperaturePageModule {}
