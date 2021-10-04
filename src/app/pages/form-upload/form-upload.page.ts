import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { UUID } from 'angular2-uuid';
import moment from 'moment';
import { finalize } from 'rxjs/operators';
import { LoadingService } from 'src/app/services/loading.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-form-upload',
  templateUrl: './form-upload.page.html',
  styleUrls: ['./form-upload.page.scss'],
})
export class FormUploadPage {

  attachment = '';
  viewer = 'google';
  selectedType = 'docx'; //'docx';
  key;
  downloadURL;
  sent = false;
  access = false;

  constructor(private afs: AngularFirestore, private toast: ToastService, private storage: Storage, private angularStorage: AngularFireStorage, private loading: LoadingService,
    private alertCtrl: AlertController, private router: Router) { }

  ngOnInIt() {
    this.storage.get('subscriptionType').then(subscriptionType => {
      if (subscriptionType !== 'basic' && subscriptionType !== undefined && subscriptionType !== null) {
        this.access = true;
      } else {
        this.access = false;
      }
    })
  }

  choosefile(event: Event) {
    if (this.access) {
      this.loading.present('Loading Document...').then(() => {
        const file = (event.target as HTMLInputElement).files[0];
        const reader = new FileReader();
        reader.onload = () => {
          this.key = UUID.UUID();
          const filePath = `/NewForms/${this.key}/${file.name}`;
          const fileRef = this.angularStorage.ref(filePath);
          const task = this.angularStorage.upload(filePath, file)
          task.snapshotChanges().pipe(
            finalize(() => {
              this.downloadURL = fileRef.getDownloadURL();
              this.downloadURL.subscribe(url => {
                this.attachment = url;
                setTimeout(() => {
                  this.loading.dismiss();
                }, 3000);
              })
            })
          ).subscribe()
        };
        reader.readAsDataURL(file);
      })
    } else {
      this.noAccessAlert();
    }
  }

  upload() {
    this.loading.present('Uploading Document...').then(() => {
      this.storage.get('user').then(user => {
        var form = {
          key: this.key,
          date: moment(new Date()).format('YYYY/MM/DD HH:mm'),
          user: user.name,
          userKey: user.key,
          attachment: this.attachment,
          company: user.company,
          companyId: user.companyId
        }
        this.afs.collection('newForms').doc(form.key).set(form);
        this.attachment = '';
        this.sent = true;
        this.loading.dismiss();
        this.toast.show('Form Submitted Successfully!')
      })
    })
  }

  async noAccessAlert() {
    var alert = await this.alertCtrl.create({
      header: 'Invalid Request',
      message: 'You do not have access to this functionality. Please upgrade if you wish to access it. Or you can contact our sales team',
      buttons: [
        {
          text: 'CANCEL',
          handler: () => {
          }
        },
        {
          text: 'Talk To Sales',
          handler: () => {
            this.router.navigate(['chat-sales'])
          }
        },
      ]
    })
    return alert.present()
  }

}
