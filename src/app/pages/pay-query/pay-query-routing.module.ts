import { NgModule } from '@angular/core';
import { ComponentsModule } from '../../components/components.module';
import {PopoverComponent} from '../../components/popover/popover.component';
import { Routes, RouterModule } from '@angular/router';

import { PayQueryPage } from './pay-query.page';

const routes: Routes = [
  {
    path: '',
    component: PayQueryPage
  }
];

@NgModule({
  entryComponents: [PopoverComponent],
  imports: [
    ComponentsModule,RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PayQueryPageRoutingModule {}
