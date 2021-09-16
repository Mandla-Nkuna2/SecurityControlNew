import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/firestore';
import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';

@Component({
  selector: 'app-view-order',
  templateUrl: './view-order.page.html',
  styleUrls: ['./view-order.page.scss'],
})
export class ViewOrderPage implements OnInit {

  order: any = {};

  params;
  data;
  technical = false;

  constructor(public navParams: NavParams, private afs: AngularFirestore, private storage: Storage, public router: Router,
    public modalCtrl: ModalController) {
    this.params = navParams.data;
  }

  ngOnInit() {
    this.storage.get('user').then(user => {
      if (user.type === 'Technician') {
        this.technical = true;
      } else {
        this.technical = false;
      }
      this.afs.collection('work-orders').doc(this.params.key).ref.get().then(order => {
        this.data = order.data();
        if (this.data) {
          this.order = this.data;
        }
      });
    });
  }

  action(order) {
    this.modalCtrl.dismiss();
    this.router.navigate(['job-card', { id: order.key }]);
  }

  saveStatus(order) {
    this.afs.collection('work-orders').doc(order.key).update({ finalStatus: order.finalStatus })
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

}
