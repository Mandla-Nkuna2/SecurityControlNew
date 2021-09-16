import { Component, OnInit } from '@angular/core';
import { NavController, Platform } from '@ionic/angular';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
// import { PrintProvider } from "../../providers/print/print";
import { Router, ActivatedRoute } from '@angular/router';
import { Storage } from '@ionic/storage';
import { map, take } from 'rxjs/operators';

@Component({
  selector: 'app-billing-breakdown',
  templateUrl: './billing-breakdown.page.html',
  styleUrls: ['./billing-breakdown.page.scss'],
})
export class BillingBreakdownPage implements OnInit {

  user = {
    key: '', companyId: '', password: '', name: '', permission: true, company: '', email: '', contact: '', type: '', trial: '',
    startDate: Date, endDate: Date
  };

  sitesCollection: AngularFirestoreCollection<any>;
  sites: Observable<any[]>;

  constructor(private afs: AngularFirestore, public navCtrl: NavController, public router: Router, private storage: Storage) {}

ngOnInit() {
  this.storage.get('user').then((user) => {
    if (user.companyId) {
      this.sitesCollection = this.afs.collection('sites', ref => ref.where('companyId', '==', user.companyId).orderBy('name'));
      this.sites = this.sitesCollection.valueChanges();
    }
  });
}

  print() {
    var printContents = document.getElementById('print-table').innerHTML;
    var originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;

    window.print();

    document.body.innerHTML = originalContents;
  }

}

