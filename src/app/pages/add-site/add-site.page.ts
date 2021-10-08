import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, LoadingController, AlertController, Platform, ActionSheetController } from '@ionic/angular';
import { LoadingService } from 'src/app/services/loading.service';
import { ToastService } from '../../services/toast.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { Storage } from '@ionic/storage';
import moment from 'moment';
import { UUID } from 'angular2-uuid';
import { GooglePlaceDirective } from 'ngx-google-places-autocomplete';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { Router, ActivatedRoute } from '@angular/router';
import { AnalyticsService } from 'src/app/services/analytics.service';

@Component({
  selector: 'app-add-site',
  templateUrl: './add-site.page.html',
  styleUrls: ['./add-site.page.scss'],
})

export class AddSitePage implements OnInit {

  site = {
    key: '', companyId: '', name: '', client: '', clientEmail: '', address: '', lat: 0, lng: 0, contact: '', email: '',
    lastVisit: '', visitBy: '',
    issues: '',
    visitKey: '', recipient: '',
  };

  user = {
    company: '', companyId: '', key: '',
  }

  nameValue: boolean = true;
  clientValue: boolean = true;
  addressValue: boolean = true;
  contactValue: boolean = true;
  emailValue: boolean = true;

  data;
  id;
  view: boolean = false;
  passedForm;

  new = true;

  @ViewChild('placesRef') placesRef: GooglePlaceDirective;

  constructor(private actionCtrl: ActionSheetController, public platform: Platform, public alertCtrl: AlertController,
    private afs: AngularFirestore, public toast: ToastService, public loadingCtrl: LoadingController, public router: Router,
    public navCtrl: NavController, public loading: LoadingService, private storage: Storage, public activatedRoute: ActivatedRoute,
    private analyticsService: AnalyticsService) {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
  }

  ngOnInit() {
    if (this.id === 'new') {
      this.platform.ready().then(() => {
        this.storage.get('user').then((user) => {
          this.site.companyId = user.companyId;
          this.user.key = user.key;
          this.site.key = UUID.UUID();
          this.site.visitBy = user.name;
          this.site.lastVisit = moment(new Date().toISOString()).locale('en').format('YYYY/MM/DD');
          this.new = true;
        });
      });
    } else {
      this.storage.get('user').then((user) => {
        this.afs.collection(`sites`).doc(this.id).ref.get().then((site: any) => {
          this.passedForm = site.data();
          if (this.passedForm) {
            this.site = this.passedForm;
            this.new = false;
          }
        });
      });
    }
  }

  getUrlData() {
    return new Promise<any>((resolve, reject) => {
      this.activatedRoute.queryParams.subscribe(params => {
        if (this.router.getCurrentNavigation().extras.state) {
          this.data = this.router.getCurrentNavigation().extras.state.data;
          resolve(this.data);
        }
      });
    });
  }

  public handleAddressChange(address: Address) {
    var add = address.formatted_address;
    this.site.address = add;
    this.site.lat = address.geometry.location.lat();
    this.site.lng = address.geometry.location.lng();
  }

  closeModal() {
    this.router.navigate(['sites']);
  }

  async errorMsg() {
    const prompt = await this.alertCtrl.create({
      header: 'Invalid Form',
      cssClass: 'alert',
      message: 'Please note that ALL fields must be completed to add a new site!',
      buttons: [
        {
          text: 'OK',
          handler: data => {
          }
        }
      ]
    });
    return await prompt.present();
  }

  check() {
    if (this.site.name !== '') {
      if (this.site.client !== '') {
        if (this.site.address !== '') {
          if (this.site.contact !== '') {
            this.save();
          } else {
            this.contactValue = false;
            this.errorMsg();
          }
        } else {
          this.addressValue = false;
          this.errorMsg();
        }
      } else {
        this.clientValue = false;
        this.errorMsg();
      }
    } else {
      this.nameValue = false;
      this.errorMsg();
    }
  }

  save() {
    if (this.new === true) {
      this.loading.present('Saving Please Wait...').then(() => {
        this.afs.collection('sites').doc(this.site.key).set(this.site).then(() => {
          this.analyticsService.logAnalyticsEvent('select_content', {
            content_type: 'ButtonClick',
            item_id: 'addSite'
          });
          this.afs.collection(`users/${this.user.key}/sites`).doc(this.site.key).set(this.site);
          this.router.navigate(['all-sites']).then(() => {
            this.loading.dismiss();
          });
        });
      });
    } else {
      this.site.key = this.site.key + '';
      this.loading.present('Saving Please Wait...').then(() => {
        this.afs.collection('sites').doc(this.site.key).update(this.site).then(() => {
          this.router.navigate(['all-sites']).then(() => {
            this.loading.dismiss();
          });
        });
      });
    }
  }

  ionViewWillEnter() {
    this.platform.ready().then(async () => {
      this.analyticsService.logAnalyticsEvent('page_view', {
        screen_name: 'Add a site',
        screen_class: 'AddSitePage'
      });
    })
  }

}
