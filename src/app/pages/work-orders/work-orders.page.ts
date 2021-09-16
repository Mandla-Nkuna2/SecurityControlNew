import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Storage } from '@ionic/storage';
import { ViewOrderPage } from '../view-order/view-order.page';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-work-orders',
  templateUrl: './work-orders.page.html',
  styleUrls: ['./work-orders.page.scss'],
})
export class WorkOrdersPage implements OnInit {

  orders = [];

  term;

  app = false;

  tech = false;
  constructor(private afs: AngularFirestore, private storage: Storage, public modalCtrl: ModalController, public router: Router) { }

  ngOnInit() {
    this.storage.get('user').then(user => {
      if (user.type === 'Technician') {
        this.tech = true;
        this.afs.collection('work-orders').ref.where('assignedKey', '==', user.key).orderBy('date', 'desc').orderBy('time', 'desc').limit(30).get().then(orders => {
          orders.forEach(order => {
            this.orders.push(order.data());
          });
          if (window.innerWidth > 1024) {
            this.app = false;
          } else {
            this.app = true;
          }
        });
      } else {
        this.tech = false;
        this.afs.collection('work-orders').ref.orderBy('date', 'desc').orderBy('time', 'desc').limit(30).get().then(orders => {
          orders.forEach(order => {
            this.orders.push(order.data());
          });
          if (window.innerWidth > 1024) {
            this.app = false;
          } else {
            this.app = true;
          }
        });
      }
    })

  }

  create() {
    this.router.navigate(['/work-order-form'])
  }

  async view(order) {
    const modal = await this.modalCtrl.create({
      component: ViewOrderPage,
      componentProps: { key: order.key }
    });
    return await modal.present();
  }

}
