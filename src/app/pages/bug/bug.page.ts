import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams, LoadingController, ModalController } from '@ionic/angular';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { ToastService } from '../../services/toast.service';
import { UUID } from 'angular2-uuid';
import * as firebase from 'firebase';
import { LoadingService } from 'src/app/services/loading.service';
import { map } from 'rxjs/operators';
import { Storage } from '@ionic/storage';
import moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-bug',
  templateUrl: './bug.page.html',
  styleUrls: ['./bug.page.scss'],
})
export class BugPage implements OnInit {

  bug = {
    key: '',
    dateStamp: '',
    details: '',
    image: '',
    user: '',
    email: '',
    contact: '',
    company: '',
    type: '',
  };

  user = {
    key: '', companyId: '', password: '', name: '', permission: true, company: '', email: '', contact: '', type: '', trial: '',
    startDate: Date, endDate: Date
  };

  usersCollection: AngularFirestoreCollection<any>;
  users: Observable<any[]>;

  id;
  data;
  view = false;
  passedForm;

  @ViewChild('bugInput') bugInput: ElementRef;

  constructor(public toast: ToastService, public loadingCtrl: LoadingController, private afs: AngularFirestore,
    public navCtrl: NavController, public navParams: NavParams, private storage: Storage, public loading: LoadingService,
    public modalCtrl: ModalController, public activatedRoute: ActivatedRoute, public router: Router) {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
  }

  ngOnInit() {
    if (this.id === 'new') {
      this.bug.key = UUID.UUID();
      this.bug.dateStamp = moment(new Date().toISOString()).locale('en').format('YYYY/MM/DD');
      this.storage.get('user').then((user) => {
        if (user.key) {
          var id = user.key;
        }
        this.usersCollection = this.afs.collection(`Users`, ref => ref.where('key', '==', id));
        this.users = this.usersCollection.snapshotChanges().pipe(map(changes => {
          return changes.map((a: any) => {
            const info = a.payload.doc.data();
            const key = a.payload.doc.id;
            return { key, ...info };
          });
        }));
        this.users.subscribe(users => {
          users.forEach(user => {
            this.user.permission = user.permission;
            this.bug.company = user.company;
            this.bug.email = user.email;
            this.bug.contact = user.contact;
            this.bug.user = user.name;
            this.user.key = user.key;
            this.bug.type = user.type;
          });
        });
      });
    } else if (this.id === 'view') {
      this.view = true;
      this.getUrlData().then(() => {
        this.afs.collection('Bugs').doc(this.data.key).ref.get().then((bug) => {
          this.passedForm = bug.data();
          if (this.passedForm) {
            this.bug = this.passedForm;
          }
        });
      });
    }
    else {
      this.storage.get(this.id).then((bug) => {
        this.bug = bug;
      });
    }
  }

  getUrlData() {
    return new Promise<any>((resolve, reject) => {
      this.activatedRoute.queryParams.subscribe(params => {
        if (this.router.getCurrentNavigation().extras.state) {
          this.data = this.router.getCurrentNavigation().extras.state.data;
          resolve(this.data);
        }
      });
    });
  }

  resize() {
    this.bugInput.nativeElement.style.height = this.bugInput.nativeElement.scrollHeight + 'px';
  }

  fileSelected(event: any) {
    const file: File = event.target.files[0];
    const metaData = { contentType: file.type };
    const storageRef: firebase.storage.Reference = firebase.storage().ref(`Bugs/${this.bug.user}/${this.bug.key}`);
    const uploadtask: firebase.storage.UploadTask = storageRef.put(file, metaData);
    uploadtask.then((uploadSnapshot: firebase.storage.UploadTaskSnapshot) => {
      const downloadURL = uploadSnapshot.downloadURL;
      this.bug.image = downloadURL;
      this.toast.show('Thank You! Screenshot Successfully Uploaded!').then(() => {
      });
    });
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

  submit(bug) {
    this.afs.collection('Bugs').doc(this.bug.key).set(bug).then(() => {
      this.toast.show('Bug Report Sent!');
      this.modalCtrl.dismiss();
      this.loading.dismiss();
    });
  }

}

