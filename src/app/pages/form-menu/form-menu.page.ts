import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { AngularFirestore } from '@angular/fire/firestore';
import { LoadingService } from 'src/app/services/loading.service';
import { NavController, NavParams } from '@ionic/angular';
import { NavigationExtras } from '@angular/router';
import { ParadePage } from '../parade/parade.page';

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
  forms = [
    { name: ' SITE VISIT REPORT', icon: 'home' },
    { name: ' SITE VISIT REPORT', icon: 'home' },
    { name: ' TRAINING FORM', icon: 'barcode' },
    { name: ' APPEAL FORM', icon: 'cube' },
    { name: ' SITE TEMPERATRURE', icon: 'thermometer' },
    { name: ' PERFORMANCE APPRAISAL', icon: 'bar-chart' },
    { name: ' FENCE INSPECTION', icon: 'apps' },
    { name: ' GRIEVANCE FORM', icon: 'sad' },
    { name: ' POLYGRAPH  ', icon: 'help' },
    { name: ' PAY QUERY', icon: 'wallet' },
    { name: ' RESIGNATION  ', icon: 'power' },
    { name: ' INJURY  ', icon: 'medkit' },
    { name: ' Fire  ', icon: 'flame' },
    { name: ' GAS EXPLOSION', icon: 'flower' },
    { name: ' CHECKLIST EXTINGUISHER', icon: 'clipboard' },
    { name: ' THEFT  REPORT', icon: 'people' },
    { name: ' UNIFORM ORDER', icon: 'shirt' },
    { name: ' VEHICLE INSPECTION', icon: 'car' },
    { name: ' CRIME INCIDENT REPORT', icon: 'eye' },
    { name: ' INCIDENT NOTIFICATION', icon: 'warning' },
    { name: ' RISK ASSESSMENT', icon: 'nuclear' },
    { name: ' GENERAL INCIDENT REPORT', icon: 'alert' },
    { name: ' LEAVE APPLICATION', icon: 'exit' },
    { name: ' DISCIPLINARY REPORT', icon: 'thumbs-down' },
    { name: ' MEETING REPORT', icon: 'cafe' },
    { name: ' CLIENT INSTRUCTION', icon: 'create' },
    { name: ' EQUIPMENT INVENTORY', icon: 'build' },
    { name: ' INCIDENT REPORT', icon: 'warning' },
    { name: ' EMPLOYEE PERFORMANCE EVALUATION FORM', icon: 'thumbs-up' },
    { name: ' NON-CONFORMANCE FORM', icon: 'card' },
    { name: ' OB ENTRY', icon: 'clipboard' },
    { name: ' PNP SITE VISIST', icon: 'home' },
    { name: ' TENANT VISIT', icon: 'home' },
    { name: ' TRANSPARENCY REPORT', icon: 'home' },
    { name: ' WORK ORDER ACKNOWLEDGEMENT', icon: 'clipboard' },
    { name: ' ACKNOWLEDGEMENT OF DEBT', icon: 'card' }

  ]

  constructor(
    private storage: Storage,
    public loading: LoadingService,
    private navController: NavController,

  ) { }

  ngOnInit() {
    this.storage.get('user').then((user) => {
      this.companyId = user.companyId;
      this.userKey = user.key
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
  openForm(formName: string) {

    const params: NavigationExtras = {
      state: { formName }

    }
    this.navController.navigateForward('/form', params)
  }

}

