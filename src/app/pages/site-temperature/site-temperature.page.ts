import { Component, OnInit } from '@angular/core';
import { NavController, AlertController, LoadingController, Platform, ActionSheetController } from '@ionic/angular';
import { UUID } from 'angular2-uuid';
import moment from 'moment';
import { AngularFirestore } from '@angular/fire/firestore';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Storage } from '@ionic/storage';
import { LoadingService } from 'src/app/services/loading.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastService } from 'src/app/services/toast.service';
import { PdfService } from 'src/app/services/pdf.service';


@Component({
  selector: 'app-site-temperature',
  templateUrl: './site-temperature.page.html',
  styleUrls: ['./site-temperature.page.scss'],
})

export class SiteTemperaturePage implements OnInit {


  constructor(
    public PdfService:PdfService , public actionCtrl: ActionSheetController, private platform: Platform, public geolocation: Geolocation,
    private afs: AngularFirestore, public toast: ToastService, public loadingCtrl: LoadingController,
    public alertCtrl: AlertController, public navCtrl: NavController, private storage: Storage,
    public loading: LoadingService, public router: Router, public activatedRoute: ActivatedRoute) {
    this.id = this.activatedRoute.snapshot.paramMap.get('id'); // offline 1/6

  }
  id;
  appeal = {
    report: 'site-temperature',
    key: '',
    site: [],
    date: '',
    user: '',
    userKey: '',
    userEmail: '',
    company: '',
    companyId: '',
    area: '',
  }

  area = true

  async exit() {
    let prompt = await this.alertCtrl.create({
      header: 'Exit Form',
      message: 'Are you sure you want to Exit?',
      cssClass: 'alert',
      buttons: [
        {
          text: 'CANCEL',
          handler: data => {
          }
        },
        {
          text: 'EXIT',
          handler: () => {
            this.navCtrl.pop();
          }
        }
      ]
    });
    return await prompt.present();
  }

  async before() { 
    const actionSheet = await this.actionCtrl.create({
      header: ``,
      mode: 'ios',
      cssClass: 'actionSheet',
      buttons: [
        {
          text: 'SAVE',
          // icon: 'save',
          // cssClass: 'successAction',
          handler: () => {
                  this.save()

          },

        },
        {
          text: 'SAVE & DOWNLOAD',
          // icon: 'save',
          // cssClass: 'successAction',
          handler: () => {
            this.PdfService.download(this.appeal).then(()=>{
                            this.save()
                          })
          },

        }
      ]
    });
    await actionSheet.present();
  }


  ngOnInit() {




    if (this.id === 'new') {
      this.storage.get('user').then((user) => {
        this.appeal.user = user.name;
        this.appeal.userKey = user.key;
        this.appeal.userEmail =  user.email;
        this.appeal.company = user.company;
        this.appeal.companyId = user.companyId;
        this.appeal.key = UUID.UUID();
        this.appeal.date = moment(new Date().toISOString()).locale('en').format('YYYY/MM/DD');
      });


    } else {
      this.storage.get(this.id).then((visit) => {
        this.appeal = visit;
      });
    }
  }

  add() { this.appeal.site.push({ compNumber: '', site: '', temp: '' }) }

  async invalidActionSheet() { // offline 6/6
    const actionSheet = await this.actionCtrl.create({
      header: `Incomplete Form: Complete the highlighted in order to save`,
      mode: 'ios',
      cssClass: 'actionSheet',
      buttons: [
        {
          text: 'OK',
          // icon: 'save',
          // cssClass: 'successAction',
          handler: () => {
          },

        },
        {
          text: 'SAVE & EXIT',
          // icon: 'save',
          // cssClass: 'successAction',
          handler: () => {
            this.storage.set(this.appeal.key, this.appeal).then(() => {
              this.navCtrl.pop();
            })
          },

        }
      ]
    });
    await actionSheet.present();
  }


  check() {

    if (this.appeal.area == '') { this.area = false } else { this.area = true }
    if (this.area == true) { this.before() }
    else { this.invalidActionSheet() }
  }


  save() {


    this.storage.set(this.appeal.key, this.appeal).then(() => { //offline 7  /////
      this.loading.present('Saving').then(() => {
        this.afs.collection('temperatureList').doc(this.appeal.key).set(this.appeal).then(() => {
          this.loading.dismiss()
          this.toast.show('Saved')

          this.storage.remove(this.appeal.key).then(() => {
            this.router.navigate(['forms']).then(() => {
              this.loading.dismiss().then(() => {
                this.toast.show('Saved Successfully!');
              });
            });
          });
        })
      })
    })
  }







}

