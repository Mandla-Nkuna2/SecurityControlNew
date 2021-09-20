import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { AlertController } from '@ionic/angular';
import { retry } from 'rxjs/operators';
import { BulkUploadService } from 'src/app/services/bulk-upload.service';
import { LoadingService } from 'src/app/services/loading.service';
import { ToastService } from 'src/app/services/toast.service';
import { GooglePlaceDirective } from 'ngx-google-places-autocomplete';
import { Address } from 'ngx-google-places-autocomplete/objects/address';

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

  constructor(private BUService: BulkUploadService, private alertCtrl: AlertController,
    private afs: AngularFirestore, private loading: LoadingService, private toast: ToastService) { }

  ngOnInit() {
  }

  changeTab(type) {
    this.selected = type;
  }

  downloadTemplate() {
    var url;
    if (this.selected === 'Sites') {
      url = 'https://firebasestorage.googleapis.com/v0/b/security-control-app.appspot.com/o/SitesTemplate.xlsx?alt=media&token=e21cc352-219b-4e45-b253-16739c9eb6ec';
    } else {
      url = 'https://firebasestorage.googleapis.com/v0/b/security-control-app.appspot.com/o/GuardsTemplate.xlsx?alt=media&token=e920a9e7-0c9c-4ece-8f21-1f81b002064c';
    }
    window.open(url);
  }

  attach() {
    this.filePickerRef.nativeElement.click();
  }

  uploadTemplate(event: Event) {
    this.BUService.onFileChange(event).then((data) => {
      this.BUService.configure(data, this.selected).then((list) => {
        if (this.selected === 'Sites') {
          this.sites = list;
        } else {
          this.guards = list;
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

  save() {
    this.loading.present(`Saving ${this.selected}...`).then(() => {
      if (this.selected === 'Sites') {
        this.sites.forEach(site => {
          this.afs.collection('sites').doc(site.key).set(site);
        })
      } else {
        this.guards.forEach(guard => {
          this.afs.collection('guards').doc(guard.key).set(guard);
        })
      }
      this.loading.dismiss();
      this.sites = [];
      this.guards = [];
      this.toast.show('Saved Successfully');
    })
  }

}
