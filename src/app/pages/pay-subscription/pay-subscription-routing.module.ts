import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PaySubscriptionPage } from './pay-subscription.page';

const routes: Routes = [
  {
    path: '',
    component: PaySubscriptionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PaySubscriptionPageRoutingModule {}
