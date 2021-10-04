import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AlertController } from '@ionic/angular';
import { BulkUploadService } from 'src/app/services/bulk-upload.service';
import { LoadingService } from 'src/app/services/loading.service';
import { ToastService } from 'src/app/services/toast.service';
import { GooglePlaceDirective } from 'ngx-google-places-autocomplete';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';

@Component({
  selector: 'app-bulk-upload',
  templateUrl: './bulk-upload.page.html',
  styleUrls: ['./bulk-upload.page.scss'],
})
export class BulkUploadPage implements OnInit {

  selected = 'Sites';
  @ViewChild('imageChooser', { static: false }) filePickerRef: ElementRef<HTMLInputElement>;
  sites = [];
  guards = [];
  @ViewChild('placesRef') placesRef: GooglePlaceDirective;
  guardOption = '';
  options = ['No Site', 'Select Site']
  userSites = []
  guardsAvailable = true;
  guardSite;
  access = false;

  constructor(private BUService: BulkUploadService, private alertCtrl: AlertController, private storage: Storage,
    private afs: AngularFirestore, private loading: LoadingService, private toast: ToastService, private router: Router) { }

  ngOnInit() {
    this.storage.get('subscriptionType').then(subscriptionType => {
      if (subscriptionType !== 'basic' && subscriptionType !== undefined && subscriptionType !== null) {
        this.access = true;
      } else {
        this.access = false;
      }
    })
  }

  changeTab(type) {
    this.selected = type;
    this.sites = [];
    this.guards = [];
    this.guardsAvailable = true;
  }

  getSites(guardOption) {
    if (this.access) {
      if (guardOption === 'No Site') {
        this.guardsAvailable = false;
      } else {
        this.guardsAvailable = true;
      }
      this.BUService.getUser().then((user) => {
        this.BUService.getUserSites(user).then(sites => {
          this.userSites = sites;
        })
      })
    } else {
      this.noAccessAlert();
    }
  }

  selectedSite(event) {
    this.guardSite = event.value;
    this.guardsAvailable = false;
    this.guards = [];
  }

  downloadTemplate() {
    if (this.access) {
      var url;
      if (this.selected === 'Sites') {
        url = 'https://firebasestorage.googleapis.com/v0/b/security-control-app.appspot.com/o/SitesTemplate.xlsx?alt=media&token=e21cc352-219b-4e45-b253-16739c9eb6ec';
      } else {
        url = 'https://firebasestorage.googleapis.com/v0/b/security-control-app.appspot.com/o/GuardsTemplate.xlsx?alt=media&token=e920a9e7-0c9c-4ece-8f21-1f81b002064c';
      }
      window.open(url);
    } else {
      this.noAccessAlert();
    }
  }

  attach() {
    if (this.access) {
      this.filePickerRef.nativeElement.click();
    } else {
      this.noAccessAlert();
    }
  }

  uploadTemplate(event: Event) {
    this.BUService.onFileChange(event).then((data) => {
      this.BUService.configure(data, this.selected).then((list) => {
        if (this.selected === 'Sites') {
          this.sites = list;
        } else {
          this.BUService.checkGuards(list).then(newList => {
            console.log(newList);
            if (this.guardOption === 'No Site') {
              this.guards = newList;
            } else {
              this.BUService.setGuardSite(newList, this.guardSite).then(newestList => {
                this.guards = newestList;
              })
            }
          })
        }
      })
    }).catch(() => {
      this.errorAlert();
    })
  }

  async errorAlert() {
    var alert = await this.alertCtrl.create({
      header: 'An Error Occured',
      message: 'This file could not be uploaded. Please try again',
      buttons: [
        {
          text: 'OKAY',
          handler: data => {
          }
        },
      ]
    })
    return alert.present();
  }

  public handleAddressChange(address: Address, site) {
    var add = address.formatted_address;
    site.address = add;
    site.lat = address.geometry.location.lat();
    site.lng = address.geometry.location.lng();
  }

  setGuardSite(event, item) {
    item.site = event.value.name;
    item.siteId = event.value.key;
  }


  save() {
    this.loading.present(`Saving ${this.selected}...`).then(() => {
      if (this.selected === 'Sites') {
        this.sites.forEach(site => {
          this.afs.collection('sites').doc(site.key).set(site);
        })
      } else {
        this.guards.forEach(guard => {
          if (guard.exists === true) {
            this.afs.collection('guards').doc(guard.Key).update(guard);
          } else {
            this.afs.collection('guards').doc(guard.Key).set(guard);
          }
        })
      }
      this.loading.dismiss();
      this.sites = [];
      this.guards = [];
      this.toast.show('Saved Successfully');
    })
  }

  async noAccessAlert() {
    var alert = await this.alertCtrl.create({
      header: 'Invalid Request',
      message: 'You do not have access to this functionality. Please upgrade if you wish to access it. Or you can contact our sales team',
      buttons: [
        {
          text: 'CANCEL',
          handler: () => {
          }
        },
        {
          text: 'Talk To Sales',
          handler: () => {
            this.router.navigate(['chat-sales'])
          }
        },
      ]
    })
    return alert.present()
  }

}
