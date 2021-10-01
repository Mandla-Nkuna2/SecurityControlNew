import { Component, OnInit } from '@angular/core';
import { UUID } from 'angular2-uuid';
import { Platform, AlertController, NavController } from '@ionic/angular';
import { LoadingService } from 'src/app/services/loading.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Router } from '@angular/router';

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

  constructor(public router: Router, public navCtrl: NavController, public alertCtrl: AlertController, public platform: Platform, private auth: AuthenticationService, public loading: LoadingService) { }

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
                      reject(2);
                    }
                  }
                  else {
                    this.confirmPasswordValue = false;
                    reject(3);
                  }
                }
                else {
                  this.passwordLength = false;
                  reject(4);
                }
              }
              else {
                this.passwordValue = false;
                reject(5);
              }
            }
            else {
              this.validEmailValue = false;
              reject(6);
            }
          }
          else {
            this.emailValue = false;
            reject(7);
          }
        }
        else {
          this.nameValue = false;
          reject(8);
        }
      }
      else {

        this.companyValue = false;
        reject(8);
      }
    })
  }

  public register(user): void {
    this.loading.present('Creating Account Please Wait...').then(() => {
      this.check(user).then(() => {
        this.auth.register(this.user)
          .then((res) => {
            this.router.navigate(['menu']).then(() => {
              this.loading.dismiss();
            })
          }).catch(err => {
            this.presentAlert(err)
          })
      }).catch(err => {
        console.log("Error: " + err); this.loading.dismiss();
      })
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

}