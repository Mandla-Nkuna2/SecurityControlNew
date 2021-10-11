import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { NavigationExtras, Router } from '@angular/router';
import { LoadingService } from 'src/app/services/loading.service';
import { NavController, Platform } from '@ionic/angular';
import { AnalyticsService } from 'src/app/services/analytics.service';
import { FormServiceService } from 'src/app/services/form-service.service';

@Component({
  selector: 'app-saved-forms',
  templateUrl: './saved-forms.page.html',
  styleUrls: ['./saved-forms.page.scss'],
})
export class SavedFormsPage implements OnInit {

  noForms = false;
  formRefs: any = [];
  constructor(
    private platform: Platform,
    private analyticsService: AnalyticsService,
    private formService: FormServiceService,
    private navController: NavController

  ) { }

  ngOnInit() {
    this.formService.getFormRefs().then((formRefs: any[]) => {
      this.formRefs = formRefs;
    }).catch((error) => {
      this.noForms = true;
    })
  }



  open(form: any) {
    const params: NavigationExtras = {
      state: {
        formName: form.name,
        form: form.form
      }

    }
    this.navController.navigateForward('/form', params)
  }
  deleteForm(alias: string, index: number) {
    this.formService.removeFormStorage(alias).then(() => {
      this.formRefs.splice(index, 1);
      this.formService.setFormRefStorage(this.formRefs).then(() => {
        console.log('deleted')
      })

    })
  }

  ionViewWillEnter() {
    this.formService.getFormRefs().then((formRefs: any[]) => {
      this.formRefs = formRefs;
    }).catch((error) => {
      this.noForms = true;
    })
    this.platform.ready().then(async () => {
      this.analyticsService.logAnalyticsEvent('page_view', {
        screen_name: 'Saved Forms',
        screen_class: 'SavedFormsPage'
      });
    })
  }

}

