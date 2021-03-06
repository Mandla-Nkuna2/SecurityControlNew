import { MembershipService } from './../../services/membership.service';
import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { AngularFirestore } from '@angular/fire/firestore';
import { LoadingService } from 'src/app/services/loading.service';
import { DynamicInput } from '../../models/dynamic-input.model';
import { FormServiceService } from '../../services/form-service.service';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { AnalyticsService } from 'src/app/services/analytics.service';
import { ToastService } from 'src/app/services/toast.service';
@Component({
  selector: 'app-form',
  templateUrl: './form.page.html',
  styleUrls: ['./form.page.scss'],
})
export class Form implements OnInit {

  sites = [];
  companyId;
  userKey;
  user: any = {};
  doc;
  inputs: DynamicInput[] = [];
  rawInputes
  showForm = false;
  staticFields: any = {
  }
  formName = '';
  constructor(
    private storage: Storage,
    private afs: AngularFirestore,
    public loading: LoadingService,
    private formsService: FormServiceService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private membershipService: MembershipService,
    private analyticsService: AnalyticsService,
    private toast: ToastService
  ) {
    this.activatedRoute.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.formName = this.router.getCurrentNavigation().extras.state.formName;
        this.inputs = this.router.getCurrentNavigation().extras.state.form;

      }
    });
  }

  ngOnInit() {
    this.storage.get('user').then((user) => {
      this.companyId = user.companyId;
      this.user = user;
      this.userKey = user.key
      this.afs.collection(`users/${user.key}/sites`).ref.get().then((sites) => {
        sites.forEach((site: any) => {
          if (site.data().name && site.data().name !== '') {
            this.sites.push({ key: site.data().key, name: site.data().name });
          }
        });
        this.storage.set('sites', this.sites);
      });
    });
    this.inputs.forEach((input: DynamicInput) => {
      if (input.link && !input.linkFilterName) {
        this.formsService.getCollection(input.link).then((items: any[]) => {
          if (input.itemIsObject) {
            items.sort((a, b) => (a[input.itemsDisplayVal] > b[input.itemsDisplayVal]) ? 1 : -1)
          }
          input.items = items;
        })
      }
      else if (input.link && input.linkFilterName && input.linkFilterValue) {
        this.formsService.completeLink(input.linkFilterValue).then((filterValue: string) => {
          this.formsService.getCollectionByFilter(input.link, input.linkFilterName, filterValue).then((items: any[]) => {
            if (input.itemIsObject) {
              items.sort((a, b) => (a[input.itemsDisplayVal] > b[input.itemsDisplayVal]) ? 1 : -1)
            }
            input.items = items;
          })
        })
      }
    })
    this.formsService.getAssessmentEmails().then((emails: any) => {
      this.staticFields = { ...emails, ...{ userEmail: this.user.email } };
    })
    this.showForm = true;
  }

  getPlanCode(tier) {
    let codes = [{ name: "standard", code: "PLN_2nn719ok2gtr1dx", price: 50000 }, { name: "pro", code: "PLN_ikf22antkej1wsd", price: 100000 }]//will be in DB once tiers finalized
    let chosenCode = ''
    codes.forEach((code) => {
      if (code.name == tier) {
        chosenCode = code.code;
      }
    })
    return chosenCode;
  }

  download() {
    this.loading.present('Downloading Please Wait...').then(() => {
      this.open(this.doc).then(() => {
        this.loading.dismiss();
      });
    });
  }

  saveForm(event) {
    this.loading.present('SAVING FORMS').then(() => {
      let form = event;
      if (this.formName.indexOf('@') > -1) {
        this.formName = this.formName.split('@')[0];
      }
      this.formsService.saveForm(this.formName.replace(/ +/g, ""), this.user.key, this.user.companyId, form).then(() => {
        this.addAnalytics();
        this.loading.dismiss().then(() => {
          this.router.navigate(['main/form-menu'])
          this.toast.show('saved')
        })
      })
    })
  }

  addAnalytics() {
    this.analyticsService.logAnalyticsEvent('select_content', {
      content_type: 'ButtonClick',
      item_id: `Completed ${this.formName}`,
    });
  }

  async open(doc) {
    await window.open('https:firebasestorage.googleapis.com/v0/b/security-control-app.appspot.com/o/DISCIPLINARY%20CODE%20OF%20OFFENCES.docx?alt=media&token=5c722397-1e50-4212-bf0c-35bf0e7f4913')
  }

}

