import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PaySubscriptionPageRoutingModule } from './pay-subscription-routing.module';

import { PaySubscriptionPage } from './pay-subscription.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PaySubscriptionPageRoutingModule
  ],
  declarations: [PaySubscriptionPage]
})
export class PaySubscriptionPageModule {}
