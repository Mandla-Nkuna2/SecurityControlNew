import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { NavController, LoadingController, AlertController, Platform, ActionSheetController, ModalController } from '@ionic/angular';
import { LoadingService } from 'src/app/services/loading.service';
import { ToastService } from '../../services/toast.service';
import { AngularFirestoreCollection, AngularFirestore } from '@angular/fire/firestore';
import { Storage } from '@ionic/storage';
import { UUID } from 'angular2-uuid';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.page.html',
  styleUrls: ['./add-user.page.scss'],
})
export class AddUserPage implements OnInit {

  user = {
    key: '', name: '', company: '', companyId: '', type: '', contact: '', email: '', password: '', sites: [],
  };

  nameValue: boolean = true;
  typeValue: boolean = true;
  emailValue: boolean = true;
  passwordValue: boolean = true;

  data;
  id;
  passedForm;

  new = false;
  edit = false;
  view = false;

  sitesCollection: AngularFirestoreCollection<any>;
  sites: Observable<any[]>;

  userSiteCollection: AngularFirestoreCollection<any>;
  userSite: Observable<any[]>;

  siteList = [];
  siteFinal = [];
  currentSites = [];
  deleteSites = [];

  seeSites = false;

  order: string = 'name';
  thompsons = false;

  constructor(public platform: Platform, public alertCtrl: AlertController,
    private afs: AngularFirestore, public toast: ToastService, public loadingCtrl: LoadingController, public activatedRoute: ActivatedRoute,
    public navCtrl: NavController, public loading: LoadingService, private storage: Storage, public modalCtrl: ModalController,
    public router: Router) {
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
  }

  ngOnInit() {
    if (this.id === 'new') {
      this.platform.ready().then(() => {
        this.storage.get('user').then((user) => {
          this.user.company = user.company;
          this.user.companyId = user.companyId;
          if (this.user.companyId === '0qbfVjnyuKE8EAdenn3T') {
            this.thompsons = true;
          } else {
            this.thompsons = false;
          }
          this.user.key = UUID.UUID();
          this.new = true;
          this.afs.collection('sites', ref => ref.where('companyId', '==', this.user.companyId)).ref.get().then((sites) => {
            sites.forEach((site: any) => {
              if (site.data().companyId === this.user.companyId) {
                this.siteList.push({ name: site.data().name, key: site.data().key, selected: false });
              }
            })
          })
        });
      });
    } else if (this.id === 'view') {
      this.view = true;
      this.getUrlData().then(() => {
        this.afs.collection('users').doc(this.data.key).ref.get().then((user) => {
          this.passedForm = user.data();
          if (this.passedForm) {
            this.user = this.passedForm;
            this.userSiteCollection = this.afs.collection(`users/${this.user.key}/sites`);
            this.userSite = this.userSiteCollection.valueChanges();
            this.new = false;
          }
        });
      });
    } else if (this.id === 'edit') {
      this.edit = true;
      var siteKey = '';
      this.getUrlData().then(() => {
        this.afs.collection('users').doc(this.data.key).ref.get().then((user) => {
          this.passedForm = user.data();
          if (this.passedForm) {
            this.user = this.passedForm;
            this.afs.collection('sites', ref => ref.where('companyId', '==', this.user.companyId)).ref.get().then((sites) => {
              sites.forEach((site: any) => {
                if (site.data().companyId === this.user.companyId) {
                  this.siteList.push({ name: site.data().name, key: site.data().key, selected: false });
                }
              })
              this.afs.collection(`users/${this.user.key}/sites`).ref.get().then(sites => {
                sites.forEach((site: any) => {
                  this.currentSites.push({ name: site.data().name, key: site.data().key, selected: true })
                })
                console.log(this.currentSites)
                for (var i=0; i < this.siteList.length; i++) {
                  for (var j=0; j < this.currentSites.length; j ++) {
                    if (this.siteList[i].name === this.currentSites[j].name) {
                      console.log(this.siteList[i].name)
                      this.siteList.splice(i, 1);
                    }
                  }
                }
                setTimeout(() => {
                  this.currentSites.forEach(site => {
                    this.siteList.push(site);
                  })  
                }, 2000);
                
              })
            })
          }
        })
      })
    };
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

  async errorMsg() {
    const prompt = await this.alertCtrl.create({
      header: 'Invalid Form',
      cssClass: 'alert',
      message: 'Please note that ALL fields must be completed to add a new user!',
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

  addToList(site) {
    if (site.selected === false) {
      this.siteFinal.push(site);
      for (var i = 0; i < this.deleteSites.length; i++) {
        if (this.deleteSites[i] === site) {
          this.deleteSites.splice(i, 1);
        }
      }
    } else {
      for (var i = 0; i < this.siteFinal.length; i++) {
        if (this.siteFinal[i] === site) {
          this.siteFinal.splice(i, 1);
        }
      }
      if (this.edit) {
        this.deleteSites.push(site)
      }
    }
  }

  check() {
    if (this.user.name !== '') {
      if (this.user.type !== '') {
        if (this.user.email !== '') {
          if (this.user.password !== '') {
            this.save();
          } else {
            this.passwordValue = false;
            this.errorMsg();
          }
        } else {
          this.emailValue = false;
          this.errorMsg();
        }
      } else {
        this.typeValue = false;
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
        this.afs.collection('users').doc(this.user.key).set(this.user).then(() => {
          this.siteFinal.forEach(site => {
            var key = site.key + '';
            this.afs.collection(`users/${this.user.key}/sites`).doc(key).set({ name: site.name, key: key });
          })
          this.router.navigate(['users']).then(() => {
            this.loading.dismiss();
          });
        });
      });
    } else if (this.edit === true) {
      this.loading.present('Saving Please Wait...').then(() => {
        this.afs.collection('users').doc(this.user.key).update(this.user).then(() => {
          this.siteFinal.forEach(site => {
            var key = site.key + '';
            this.afs.collection(`users/${this.user.key}/sites`).doc(key).set({ name: site.name, key: key });
          })
          this.deleteSites.forEach(site => {
            var key = site.key + '';
            this.afs.collection(`users/${this.user.key}/sites`).doc(key).delete();
          })
          this.router.navigate(['users']).then(() => {
            this.loading.dismiss();
          });
        });
      });
    }
  }

}


/*

sortSites() {

    this.sortedSites = this.allSites;
    this.sortedSites.forEach(sortedSite => {
      this.userSites.forEach(userSite => {
        if (sortedSite.key === userSite.key) {
          sortedSite.checked = true;
          console.log(sortedSite.name, sortedSite.checked);
        } else {
          sortedSite.checked = false;
        }
      });
    });
  }

  */
