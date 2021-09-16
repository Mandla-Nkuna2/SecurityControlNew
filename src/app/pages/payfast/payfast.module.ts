import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PayfastPageRoutingModule } from './payfast-routing.module';

import { PayfastPage } from './payfast.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PayfastPageRoutingModule
  ],
  declarations: [PayfastPage]
})
export class PayfastPageModule {}
