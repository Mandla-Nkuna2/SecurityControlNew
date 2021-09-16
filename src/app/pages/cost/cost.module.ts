import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CostPageRoutingModule } from './cost-routing.module';

import { CostPage } from './cost.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CostPageRoutingModule
  ],
  declarations: [CostPage]
})
export class CostPageModule {}
