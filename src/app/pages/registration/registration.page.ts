import { Component, OnInit } from '@angular/core';
import { UUID } from 'angular2-uuid';
import { Platform, AlertController, NavController } from '@ionic/angular';
import { LoadingService } from 'src/app/services/loading.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Router } from '@angular/router';
import { AnalyticsService } from 'src/app/services/analytics.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.page.html',
  styleUrls: ['./registration.page.scss'],
})

export class RegistrationPage implements OnInit {

  user = { key: '', name: '', companyId: '', email: '', password: '', passwordConfirm: '', companyName: '' };
  nameValue: boolean = true;
  orgValue: boolean = true;
  emailValue: boolean = true;
  companyValue: boolean = true;
  validEmailValue: boolean = true;
  passwordValue: boolean = true;
  passwordLength: boolean = true;
  confirmPasswordValue: boolean = true;
  passwordMatch: boolean = true;

  constructor(public router: Router, public navCtrl: NavController, public alertCtrl: AlertController, public platform: Platform, private auth: AuthenticationService, public loading: LoadingService, private analyticsService: AnalyticsService) { }

  ngOnInit() {
    this.platform.ready().then(() => {
      this.user.companyId = UUID.UUID();
    })
  }

  check(user) {
    return new Promise<any>((resolve, reject) => {
      if (user.companyName !== '') {
        this.companyValue = true
        if (user.name !== '') {
          this.nameValue = true;
          this.user.name = user.name;
          if (user.email !== '') {
            this.emailValue = true;
            this.user.email = user.email.replace(/\s/g, '');
            if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(user.email)) {
              this.validEmailValue = true;
              if (user.password !== '') {
                this.passwordValue = true;
                this.user.password = user.password.replace(/\s/g, '');
                if (this.user.password.length > 7) {
                  this.passwordLength = true;
                  if (user.passwordConfirm !== '') {
                    this.confirmPasswordValue = true;
                    this.user.passwordConfirm = user.passwordConfirm.replace(/\s/g, '');
                    if (this.user.password === this.user.passwordConfirm) {
                      this.passwordMatch = true;
                      resolve(1);
                    }
                    else {
                      this.passwordMatch = false;
                      reject('Your passwords do not match');
                    }
                  }
                  else {
                    this.confirmPasswordValue = false;
                    reject('Your passwords do not match');
                  }
                }
                else {
                  this.passwordLength = false;
                  reject('Your password is to short');
                }
              }
              else {
                this.passwordValue = false;
                reject('Your password is to short');
              }
            }
            else {
              this.validEmailValue = false;
              reject('You email is invalid');
            }
          }
          else {
            this.emailValue = false;
            reject('Please add an email to continue');
          }
        }
        else {
          this.nameValue = false;
          reject('Please add a name to continue');
        }
      }
      else {

        this.companyValue = false;
        reject('Please add a company name to continue');
      }
    })
  }

  public register(user): void {
    this.loading.present('Creating Account Please Wait...').then(() => {
      this.check(user).then(() => {
        this.auth.register(this.user)
          .then((res) => {
            this.analyticsService.logAnalyticsEvent('select_content', {
              content_type: 'ButtonClick',
              item_id: 'signedUp'
            });
            this.router.navigate(['menu']).then(() => {
              this.loading.dismiss();
            })
          }).catch(err => {
            this.presentAlert(err)
          })
      }).catch(err => {
        this.loading.dismiss().then(() => {
          this.presentAlert(err);
        })

        console.log("Error: " + err); this.loading.dismiss();
      })
    })
  }

  async presentAlert(err) {
    const alert = await this.alertCtrl.create({
      header: 'Uhh ohh...',
      subHeader: 'Something went wrong',
      message: err,
      buttons: ['OK']
    });
    return await alert.present();
  }

  ionViewWillEnter() {
    this.platform.ready().then(async () => {
      this.analyticsService.logAnalyticsEvent('page_view', {
        screen_name: 'Register',
        screen_class: 'RegisterPage'
      });
    })
  }

}
