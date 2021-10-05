import { Component } from '@angular/core';
import { Platform, AlertController } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { LoadingService } from 'src/app/services/loading.service';
import { Router } from '@angular/router';
import { DynamicInput } from 'src/app/models/dynamic-input.model';
import { AnalyticsService } from 'src/app/services/analytics.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {

  constructor(public router: Router, public loading: LoadingService, private authService: AuthenticationService,
    public platform: Platform, public alertCtrl: AlertController, private analyticsService: AnalyticsService) {

  }
  dynamicInputs: DynamicInput[] = [];
  email = ''
  password = ''

  login() {
    this.loading.present('Authenticating Please Wait').then(() => {
      this.authService.login(this.email, this.password)
        .then(res => {
          this.analyticsService.logAnalyticsEvent('select_content', {
            content_type: 'ButtonClick',
            item_id: 'loggedIn'
          });
          this.loading.dismiss();
        }).catch(err => {
          this.loading.dismiss().then(() => {
            this.presentAlert(err);
          });
        });
    });
  }

  ionViewWillEnter() {
    this.platform.ready().then(async () => {
      this.analyticsService.logAnalyticsEvent('page_view', {
        screen_name: 'Sign In',
        screen_class: 'SignInPage'
      });
    })
  }

  async presentAlert(err) {
    const alert = await this.alertCtrl.create({
      header: 'Uhh ohh...',
      subHeader: 'Something went wrong',
      message: err.message,
      buttons: ['OK']
    });
    return await alert.present();
  }

  goToRegister() {
    this.router.navigate(['registration'])
  }

}
