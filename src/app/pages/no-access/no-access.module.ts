import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NoAccessPageRoutingModule } from './no-access-routing.module';

import { NoAccessPage } from './no-access.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NoAccessPageRoutingModule
  ],
  declarations: [NoAccessPage]
})
export class NoAccessPageModule {}
