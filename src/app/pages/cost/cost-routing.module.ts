import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CostPage } from './cost.page';

const routes: Routes = [
  {
    path: '',
    component: CostPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CostPageRoutingModule {}
