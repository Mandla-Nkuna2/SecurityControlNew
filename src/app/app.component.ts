import { Component } from '@angular/core';
import { Platform, AlertController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Router, NavigationEnd } from '@angular/router';
import { AuthenticationService } from './services/authentication.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { Storage } from '@ionic/storage';
declare let gtag: Function;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {

  constructor(
    private router: Router,
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private authenticationService: AuthenticationService,
    private afs: AngularFirestore,
    public alertCtrl: AlertController,
    private storage: Storage,
  ) {
    this.initializeApp();
    if (platform.is('desktop')) {
      localStorage.removeItem('firebase:previous_websocket_failure');
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          gtag('config', 'G-0F1C81YWSV',
            {
              'page_path': event.urlAfterRedirects
            }
          )
        }
      })
    }
  }

  async initializeApp() {
    await this.platform.ready();
    await this.authenticationService.authState.subscribe(state => {
      if (state) {
        this.storage.get('user').then(user => {
          this.router.navigate(['menu']);
        });
      } else {
        this.router.navigate(['login']);
        this.router.events.subscribe(event => {
          if (event instanceof NavigationEnd) {
            if (event.url === '/privacy') {
              this.router.navigate(['privacy']);
            }
          }
        })
      }
    });
    if (this.platform.is('cordova')) {
      setTimeout(() => {
        this.statusBar.styleDefault();
        this.splashScreen.hide();
        this.checkVersion();
      }, 3000);
    }
  }

  checkVersion() {
    const App = 76;
    this.afs.collection('Version').doc('POSMdqh6RghyS0vXnkLk').ref.get().then((version: any) => {
      if (App < version.data().update) {
        return this.updateAlert(version.data().update);
      }
    })
  }

  async updateAlert(version) {
    let prompt = await this.alertCtrl.create({
      header: 'UPDATE AVAILABLE',
      cssClass: 'alert',
      message: `Update Version 0.0.${version} is now available for Download`,
      buttons: [
        {
          text: 'UPDATE NOW',
          handler: data => {
            window.open('https://play.google.com/store/apps/details?id=com.innovativethinking.adminforms', '_system', 'location=yes'); return false;
          }
        },
        {
          text: 'LATER',
          handler: data => {
          }
        }
      ]
    });
    return await prompt.present();
  }

}
