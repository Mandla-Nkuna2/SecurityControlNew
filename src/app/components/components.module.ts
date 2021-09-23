import { CameraComponent } from './camera/camera.component';
import {NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { SignaturePadModule } from 'angular2-signaturepad';

import { PopoverComponent } from './popover/popover.component';

@NgModule({
    declarations: [PopoverComponent, CameraComponent],
    exports: [PopoverComponent],
    imports: [IonicModule, CommonModule,SignaturePadModule],
    entryComponents: [PopoverComponent]
})
export class ComponentsModule{}
