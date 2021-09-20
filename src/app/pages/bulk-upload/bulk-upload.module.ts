import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BulkUploadPageRoutingModule } from './bulk-upload-routing.module';

import { BulkUploadPage } from './bulk-upload.page';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GooglePlaceModule,
    BulkUploadPageRoutingModule
  ],
  declarations: [BulkUploadPage]
})
export class BulkUploadPageModule {}
