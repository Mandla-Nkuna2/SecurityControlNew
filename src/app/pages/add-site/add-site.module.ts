import { NgModule } from '@angular/core';
import { ComponentsModule } from '../../components/components.module';
import {PopoverComponent} from '../../components/popover/popover.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { AddSitePage } from './add-site.page';

import { GooglePlaceModule } from 'ngx-google-places-autocomplete';

const routes: Routes = [
  {
    path: '',
    component: AddSitePage
  }
];

@NgModule({
  entryComponents: [PopoverComponent],
  imports: [
    ComponentsModule,
    CommonModule,
    FormsModule,
    IonicModule,
    GooglePlaceModule,
    RouterModule.forChild(routes)
  ],
  declarations: [AddSitePage]
})
export class AddSitePageModule {}
