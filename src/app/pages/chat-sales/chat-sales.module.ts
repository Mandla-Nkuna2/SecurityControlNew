import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChatSalesPageRoutingModule } from './chat-sales-routing.module';

import { ChatSalesPage } from './chat-sales.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChatSalesPageRoutingModule
  ],
  declarations: [ChatSalesPage]
})
export class ChatSalesPageModule {}
