import { Component, OnInit } from '@angular/core';
import { AlertController, NavController, Platform } from '@ionic/angular';
import { LoadingService } from 'src/app/services/loading.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { AnalyticsService } from 'src/app/services/analytics.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {

 
  constructor(public navCtrl: NavController, private authService: AuthenticationService, public loading: LoadingService,
    public alertCtrl: AlertController, private platform: Platform, private analyticsService: AnalyticsService) {
   }

  ngOnInit() {
  
  }

  email=''

  public requestReset(): void {
    this.loading.present('Generating Reset Link...').then(() => {
      this.authService.reset(this.email).then(() => {
        this.loading.dismiss().then(() => {
          return this.resetNotification();
        });
      }).catch(err => {
        this.loading.dismiss().then(() => {
          return this.error(err);
        });
      });
    });
  }
  goBack()
  {
    this.navCtrl.navigateBack('login');
  }
  
  async resetNotification() {
    const alert = await this.alertCtrl.create({
      header: 'Request Sent',
      subHeader: 'An email with a password reset link has been sent to you',
      message: 'Go to your email inbox, follow the instructions, and change the password of your account.',
      buttons: [{
        text: 'OK',
        handler: () => {
          this.navCtrl.navigateRoot('/login');
        }
      }]
    });
    return await alert.present();
  }

  async error(err) {
    const alert = await this.alertCtrl.create({
      header: 'Uhh ohh...',
      subHeader: 'Something went wrong',
      message: err.message,
      buttons: ['OK']
    });
    return await alert.present();
  }

  ionViewWillEnter() {
    this.platform.ready().then(async () => {
      this.analyticsService.logAnalyticsEvent('page_view', {
        screen_name: 'Reset Password',
        screen_class: 'ResetPasswordPage'
      });
    })
  }

}
