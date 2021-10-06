import { PaymentComponent } from './payment/payment.component';
import { CameraComponent } from './camera/camera.component';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { PopoverComponent } from './popover/popover.component';
import { DynamicFormComponent } from './dynamic-form/dynamic-form.component'
import { ReactiveFormsModule } from '@angular/forms';
import { SigniturePadComponent } from './signiture-popover/signiture-popover.component';
import { SignaturePadModule } from 'angular2-signaturepad';
import { ImageCropperModule } from 'ngx-image-cropper';

@NgModule({
  declarations: [PopoverComponent, DynamicFormComponent, SigniturePadComponent, CameraComponent, PaymentComponent],
  exports: [PopoverComponent, DynamicFormComponent, SigniturePadComponent, CameraComponent, PaymentComponent],
  imports: [
    IonicModule,
    CommonModule,
    SignaturePadModule,
    ReactiveFormsModule,
    ImageCropperModule,
  ],
  entryComponents: [PopoverComponent]
})
export class ComponentsModule { }
