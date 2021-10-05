import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { AngularFirestore } from '@angular/fire/firestore';
import { LoadingService } from 'src/app/services/loading.service';
import { NavController, NavParams } from '@ionic/angular';
import { NavigationExtras } from '@angular/router';
import { ParadePage } from '../parade/parade.page';
import { FormServiceService } from 'src/app/services/form-service.service';

@Component({
  selector: 'app-forms',
  templateUrl: './form-menu.page.html',
  styleUrls: ['./form-menu.page.scss'],
})
export class FormMenuPage implements OnInit {

  sites = [];
  companyId;
  userKey;
  doc;
  // will eventually move to db  once we have the forms
  forms: any = [];

  constructor(
    private storage: Storage,
    public loading: LoadingService,
    private navController: NavController,
    private formService: FormServiceService

  ) { }

  ngOnInit() {
    this.storage.get('user').then((user) => {
      this.companyId = user.companyId;
      this.userKey = user.key
      this.formService.getForms().then((forms: any[]) => {
        this.forms = forms;
      })
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
  openForm(formName: string, form: any) {
    if (!form) {
      form = [];
    }
    const params: NavigationExtras = {
      state: { formName, form }

    }
    this.navController.navigateForward('/form', params)
  }

}

