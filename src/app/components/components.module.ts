import { CameraComponent } from './camera/camera.component';
import {NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { PopoverComponent } from './popover/popover.component';
import { DynamicFormComponent } from './dynamic-form/dynamic-form.component'
import { ReactiveFormsModule } from '@angular/forms';
import { SigniturePadComponent } from './signiture-popover/signiture-popover.component';
import { SignaturePadModule } from 'angular2-signaturepad';
import { ImageCropperModule } from 'ngx-image-cropper';

@NgModule({
  declarations: [PopoverComponent, DynamicFormComponent, SigniturePadComponent, CameraComponent],
  exports: [PopoverComponent, DynamicFormComponent, SigniturePadComponent, CameraComponent],
  imports: [
    IonicModule,
    CommonModule,
    SignaturePadModule,
    ReactiveFormsModule,
    SignaturePadModule,
    ImageCropperModule,
  ],
  entryComponents: [PopoverComponent]
})
export class ComponentsModule { }
