import { NgModule } from '@angular/core';
import { ComponentsModule } from '../../components/components.module';
import { PopoverComponent } from '../../components/popover/popover.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { FormMenuPage } from './form-menu.page';

const routes: Routes = [
  {
    path: '',
    component: FormMenuPage
  },
  {
    path: 'form',
    loadChildren: () => import('../form/form.module').then(m => m.FormsPageModule)
  },
];

@NgModule({
  entryComponents: [PopoverComponent, FormMenuPage],
  imports: [
    ComponentsModule,
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [FormMenuPage]
})
export class FormMenuPageModule { }
