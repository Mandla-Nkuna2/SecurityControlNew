import { NgModule } from '@angular/core';
import { ComponentsModule } from '../../components/components.module';
import { PopoverComponent } from '../../components/popover/popover.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { SavedFormsPage } from './saved-forms.page';

const routes: Routes = [
  {
    path: '',
    component: SavedFormsPage
  },
  {
    path: 'form',
    loadChildren: () => import('../form/form.module').then(m => m.FormsPageModule)
  },
];

@NgModule({
  entryComponents: [PopoverComponent],
  imports: [
    ComponentsModule,
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [SavedFormsPage]
})
export class SavedFormsPageModule { }
