import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { AngularFirestore } from '@angular/fire/firestore';
import { LoadingService } from 'src/app/services/loading.service';
import { DynamicInput } from '../../models/dynamic-input.model';
import { FormServiceService } from '../../services/form-service.service'
@Component({
  selector: 'app-forms',
  templateUrl: './forms-test.page.html',
  styleUrls: ['./forms-test.page.scss'],
})
export class FormsTest implements OnInit {

  sites = [];
  companyId;
  userKey;
  user: any = {};
  doc;
  inputs: DynamicInput[] = [];
  rawInputes
  showForm = false;
  staticFields: any = {
    id: 'qwerty123',
    key: 'testtes'
  }
  constructor(
    private storage: Storage,
    private afs: AngularFirestore,
    public loading: LoadingService,
    private formsService: FormServiceService
  ) {
  }

  ngOnInit() {
    this.storage.get('user').then((user) => {
      this.companyId = user.companyId;
      this.user = user;
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
    this.inputs = this.formsService.visit.filter(x => x.hidden == false);
    this.inputs.forEach((input: DynamicInput) => {
      if (input.link) {
        this.formsService.getCollection(input.link).then((items: any[]) => {
          input.items = items;
        })
      }
    })
    setTimeout(() => {
      this.showForm = true;
    }, 5000);
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

