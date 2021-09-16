import { NgModule } from '@angular/core';
import { ComponentsModule } from '../../components/components.module';
import {PopoverComponent} from '../../components/popover/popover.component';
import { Routes, RouterModule } from '@angular/router';

import { FirePage } from './fire.page';

const routes: Routes = [
  {
    path: '',
    component: FirePage
  }
];

@NgModule({
  entryComponents: [PopoverComponent],
  imports: [
    ComponentsModule,RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FirePageRoutingModule {}
