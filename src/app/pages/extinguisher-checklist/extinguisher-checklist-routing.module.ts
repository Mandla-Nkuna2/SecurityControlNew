import { NgModule } from '@angular/core';
import { ComponentsModule } from '../../components/components.module';
import {PopoverComponent} from '../../components/popover/popover.component';
import { Routes, RouterModule } from '@angular/router';

import { ExtinguisherChecklistPage } from './extinguisher-checklist.page';

const routes: Routes = [
  {
    path: '',
    component: ExtinguisherChecklistPage
  }
];

@NgModule({
  entryComponents: [PopoverComponent],
  imports: [
    ComponentsModule,RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExtinguisherChecklistPageRoutingModule {}
