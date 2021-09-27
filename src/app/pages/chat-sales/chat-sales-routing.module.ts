import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChatSalesPage } from './chat-sales.page';

const routes: Routes = [
  {
    path: '',
    component: ChatSalesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChatSalesPageRoutingModule {}
