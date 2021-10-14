import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { LoadingService } from 'src/app/services/loading.service';
import { AlertController, NavController, Platform } from '@ionic/angular';
import { FormServiceService } from 'src/app/services/form-service.service';
import { pdfService2 } from 'src/app/services/pdf-service2.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
})
export class ReportsPage implements OnInit {


  sites: any = [];
  companyId;
  userKey;
  doc;
  forms: any = [];
  site: any = {};
  reports: any = [];
  reportsFiltererd: any = [];
  selectedForm: any = {};
  noReports = false;

  constructor(
    private storage: Storage,
    public loading: LoadingService,
    private navController: NavController,
    private formService: FormServiceService,
    private pdfService: pdfService2

  ) { }
  ngOnInit() {
    this.storage.get('user').then((user) => {
      this.companyId = user.companyId;
      this.userKey = user.key
      this.formService.getForms().then((forms: any[]) => {
        this.forms = forms;
      }).then(() => {
        this.getSites().then(() => {
        })
      })
    });
  }

  getForms() {
    this.formService.getCollectionByFilter(`${this.selectedForm.name.replace(/ +/g, "")}`, 'companyId', this.companyId).then((forms: any[]) => {
      this.reports = forms;
      this.reportsFiltererd = this.reports;
      this.noReports = false;
      if (forms.length == 0) {
        this.noReports = true;
      }
    })
  }
  getSites() {
    return new Promise((resolve, reject) => {
      this.formService.getCollection(`users/${this.userKey}/sites`).then((sites: any[]) => {
        this.sites = sites;
        console.log(sites);
        
        resolve('complete');
      })
    })
  }
  filterForms() {
    console.log('ff', this.site.key);
    
    if (this.site.key != 'All') {
      this.reportsFiltererd = this.reports.filter(x => x.siteId == this.site.key);
      this.noReports = false;
      if (this.reportsFiltererd.length == 0) {
        this.noReports = true;
      }
    }
    else {
      this.reportsFiltererd = this.reports;
    }
    console.log(this.reportsFiltererd);
    
  }
  download(formData) {
    this.pdfService.downloadPdf(this.selectedForm.name, this.selectedForm.form, formData);
  }

  ionViewWillEnter() {

  }

}



