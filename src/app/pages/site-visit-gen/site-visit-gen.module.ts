import { NgModule } from '@angular/core';
import { ComponentsModule } from '../../components/components.module';
import {PopoverComponent} from '../../components/popover/popover.component';


import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { SiteVisitGenPage } from './site-visit-gen.page';


import { SignaturePadModule } from 'angular2-signaturepad';
import { ImageCropperModule } from 'ngx-image-cropper';

const routes: Routes = [
  {
    path: '',
    component: SiteVisitGenPage
  }
];

@NgModule({
  entryComponents: [PopoverComponent],
  imports: [
    ComponentsModule,
    CommonModule,
    FormsModule,
    IonicModule,
    SignaturePadModule,
    ImageCropperModule,
    RouterModule.forChild(routes)
  ],
  declarations: [SiteVisitGenPage],

})
export class SiteVisitGenPageModule {}
