import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.page.html',
  styleUrls: ['./clients.page.scss'],
})
export class ClientsPage implements OnInit {

  clientsCollection: AngularFirestoreCollection<any>;
  clients: Observable<any[]>;

  constructor(private afs: AngularFirestore, public navCtrl: NavController) {
  }

  ngOnInit() {
    this.clientsCollection = this.afs.collection('companies', ref => ref.orderBy('startDate', 'desc'));
    this.clients = this.clientsCollection.valueChanges();
  }

}

