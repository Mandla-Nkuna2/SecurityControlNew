import { NgModule } from '@angular/core';
import { ComponentsModule } from '../../components/components.module';
import {PopoverComponent} from '../../components/popover/popover.component';
import { Routes, RouterModule } from '@angular/router';

import { PerformanceAppraisalPage } from './performance-appraisal.page';

const routes: Routes = [
  {
    path: '',
    component: PerformanceAppraisalPage
  }
];

@NgModule({
  entryComponents: [PopoverComponent],
  imports: [
    ComponentsModule,RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PerformanceAppraisalPageRoutingModule {}
