import { NgModule } from '@angular/core';
import { ComponentsModule } from '../../components/components.module';
import {PopoverComponent} from '../../components/popover/popover.component';
import { Routes, RouterModule } from '@angular/router';

import { SiteTemperaturePage } from './site-temperature.page';

const routes: Routes = [
  {
    path: '',
    component: SiteTemperaturePage
  }
];

@NgModule({
  entryComponents: [PopoverComponent],
  imports: [
    ComponentsModule,RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SiteTemperaturePageRoutingModule {}
