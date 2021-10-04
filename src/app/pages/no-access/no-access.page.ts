import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { UUID } from 'angular2-uuid';
import moment from 'moment';
import { LoadingService } from 'src/app/services/loading.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-no-access',
  templateUrl: './no-access.page.html',
  styleUrls: ['./no-access.page.scss'],
})
export class NoAccessPage implements OnInit {

  user;
  owner = false;

  constructor(private afs: AngularFirestore, private storage: Storage, private toast: ToastService, private router: Router) { }

  ngOnInit() {
    this.storage.get('user').then(user => {
      this.user = user;
      console.log(this.user)
      if (this.user.type === 'Account Admin') {
        this.owner = true;
      } else {
        this.owner = false;
      }
    })
  }

  delete() {
    var request = {
      key: UUID.UUID(),
      date: moment(new Date()).format('YYYY/MM/DD HH:mm'),
      user: this.user,
    }
    this.afs.collection('deleteRequests').doc(request.key).set(request);
    this.toast.show('Confirmation Email Sent');
  }

  upgrade() {
    // this.router.navigate(['packages'])
  }

}
