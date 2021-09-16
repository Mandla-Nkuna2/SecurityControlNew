import { Component, OnInit } from '@angular/core';
import { NavParams, LoadingController, AlertController, ModalController } from '@ionic/angular';
import { ToastService } from '../../services/toast.service';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import * as firebase from 'firebase';
import { map, take } from 'rxjs/operators';
import { LoadingService } from 'src/app/services/loading.service';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-edit-my-account',
  templateUrl: './edit-my-account.page.html',
  styleUrls: ['./edit-my-account.page.scss'],
})
export class EditMyAccountPage implements OnInit {

  user = {
    key: '', companyId: '', password: '', name: '', permission: true, company: '', email: '', contact: '', type: '', trial: false,
    startDate: Date, endDate: Date
  };

  usersCollection: AngularFirestoreCollection<any>;
  users: Observable<any[]>;
  companyCollection: AngularFirestoreCollection<any>;
  company: Observable<any[]>;
  edit;
  permission: boolean = false;
  access: boolean = false;
  nameValid: boolean = true;
  emailValid: boolean = true;
  typeValid: boolean = true;
  telValid: boolean = true;
  owner: boolean;
  params;
  update;
  logo;
  public name: string;
  public email: string;
  public type: string;
  public contact: string;
  public key: string;

  constructor(public alertCtrl: AlertController, private afs: AngularFirestore,
    public toast: ToastService, public loadingCtrl: LoadingController, public navParams: NavParams,
    public modalCtrl: ModalController, public loading: LoadingService, private storage: Storage) {
    this.params = navParams.data;
  }

  ngOnInit() {
    this.name = this.params.name;
    this.email = this.params.email;
    this.type = this.params.type;
    this.contact = this.params.contact;
    if (this.type === 'Owner') {
      this.owner = true;
    } else {
      this.owner = false;
    }
    this.storage.get('user').then((user) => {
      if (user.key) {
        var id = user.key;
      }
      this.usersCollection = this.afs.collection('users', ref => ref.where('key', '==', id));
      this.users = this.usersCollection.snapshotChanges().pipe(map(changes => {
        return changes.map     ((a: any) => { 
          const info = a.payload.doc.data();
          const key = a.payload.doc.id;
          return { key, ...info };
        });
      }));
      this.users.subscribe(users => {
        users.forEach(user => {
          this.user.permission = user.permission;
          this.user.type = user.type;
          if (this.user.type === 'Owner' || this.user.type === 'Admin' || this.user.type === 'Account Admin') {
            this.permission = true;
          }

          this.companyCollection = this.afs.collection('companies', ref => ref.where('key', '==', `${user.companyId}`));
          this.company = this.companyCollection.snapshotChanges().pipe(map(changes => {
            return changes.map     ((a: any) => { 
              const info = a.payload.doc.data();
              const key = a.payload.doc.id;
              return { key, ...info };
            });
          }));
          this.company.subscribe(companies => {
            companies.forEach(company => {
              this.user.company = company.name;
              this.user.companyId = company.key;
              this.logo = company.logo;
            });
          });
        });
      });
    });
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

  async invalidMsg() {
    let prompt = await this.alertCtrl.create({
      header: 'Invalid Form',
      message: "Please Note ALL fields marked with an '*' must be filled in to submit the form!",
      buttons: [
        {
          text: 'OK',
          handler: data => {
          }
        }
      ]
    });
    return await prompt.present();
  }

  async fileSelected(event: any) {
    const file = (event.target as HTMLInputElement).files[0];

    const reader = new FileReader();

    reader.onload = () => {

      this.loading.present('Uploading...').then(() => {

        const logo = reader.result.toString();

        this.update = {
          logo: logo,
          base64: logo
        }

        this.afs.collection('companies').doc(this.user.companyId).update(this.update).then(() => {
          this.toast.show('Thank You! Logo Successfully Uploaded!').then(() => {
            this.loading.dismiss();
          }).catch(async err => {
            this.loading.dismiss();
            let prompt = await this.alertCtrl.create({
              header: 'Error',
              message: err,
              buttons: [
                {
                  text: 'OK',
                  handler: data => {
                  }
                }
              ]
            });
            return await prompt.present();
          });
        }).catch(async err => {
          this.loading.dismiss();
          let prompt = await this.alertCtrl.create({
            header: 'Error',
            message: err,
            buttons: [
              {
                text: 'OK',
                handler: data => {
                }
              }
            ]
          });
          return await prompt.present();
        });

      })
    };

    reader.readAsDataURL(file);
  }

  async save() {
    if (this.user.contact !== undefined && this.user.contact !== '' && this.user.name !== undefined && this.user.name !== '') {
      this.loading.present('Saving Please Wait...');
      this.edit = {
        rep: this.user.name,
        contact: this.user.contact
      };
      this.afs.collection('companies').doc(this.user.companyId).update(this.edit).then(ref => {
        this.toast.show(`Your Account was Successfully Updated!`);
        this.modalCtrl.dismiss();
        this.loading.dismiss();
      }).catch(async err => {
        this.loading.dismiss();
        let prompt = await this.alertCtrl.create({
          header: 'Error',
          message: err,
          buttons: [
            {
              text: 'OK',
              handler: data => {
              }
            }
          ]
        });
        return await prompt.present();
      });
    } else {
      this.invalidMsg();
    }
    if (this.user.name !== undefined && this.user.name !== '') {
      this.nameValid = true;
      if (this.user.contact !== undefined && this.user.contact !== '') {
        this.telValid = true;
      } else {
        this.telValid = false;
      }
    } else {
      this.nameValid = false;
    }
  }
}

