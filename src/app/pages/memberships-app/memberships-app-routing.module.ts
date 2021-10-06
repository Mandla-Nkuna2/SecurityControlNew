import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MembershipsAppPage } from './memberships-app.page';

const routes: Routes = [
  {
    path: '',
    component: MembershipsAppPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MembershipsAppPageRoutingModule {}
