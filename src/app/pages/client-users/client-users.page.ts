import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-client-users',
  templateUrl: './client-users.page.html',
  styleUrls: ['./client-users.page.scss'],
})
export class ClientUsersPage implements OnInit {

  clientsCollection: AngularFirestoreCollection<any>;
  clients: Observable<any[]>;

  constructor(private afs: AngularFirestore, public navCtrl: NavController) {
  }

  ngOnInit() {
    this.clientsCollection = this.afs.collection('users', ref => ref.orderBy('company'));
    this.clients = this.clientsCollection.valueChanges();
  }

}

