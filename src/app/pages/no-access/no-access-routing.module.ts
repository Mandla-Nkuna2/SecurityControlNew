import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NoAccessPage } from './no-access.page';

const routes: Routes = [
  {
    path: '',
    component: NoAccessPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NoAccessPageRoutingModule {}
