import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MembershipsAppPageRoutingModule } from './memberships-app-routing.module';

import { MembershipsAppPage } from './memberships-app.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MembershipsAppPageRoutingModule
  ],
  declarations: [MembershipsAppPage]
})
export class MembershipsAppPageModule {}
