import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { AngularFirestore } from '@angular/fire/firestore';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
  selector: 'app-forms',
  templateUrl: './forms.page.html',
  styleUrls: ['./forms.page.scss'],
})
export class FormsPage implements OnInit {

  sites = [];
  companyId;
  userKey;
  doc;

  constructor(private storage: Storage, private afs: AngularFirestore, public loading: LoadingService) { }

  ngOnInit() {
    this.storage.get('user').then((user) => {
      this.companyId = user.companyId;
      this.userKey = user.key
      console.log(user);
      

      this.afs.collection(`users/${user.key}/sites`).ref.get().then((sites) => {
        sites.forEach((site: any) => {
          if (site.data().name && site.data().name !== '') {
            this.sites.push({ key: site.data().key, name: site.data().name });
          }
        });
        this.storage.set('sites', this.sites); 
        console.log('sites', this.sites);
              
      });
    });
  }

  download() {
    this.loading.present('Downloading Please Wait...').then(() => {
      this.open(this.doc).then(() => {
        this.loading.dismiss();
      });
    });
  }

  async open(doc) {
    await window.open('https://firebasestorage.googleapis.com/v0/b/security-control-app.appspot.com/o/DISCIPLINARY%20CODE%20OF%20OFFENCES.docx?alt=media&token=5c722397-1e50-4212-bf0c-35bf0e7f4913')
  }

}

