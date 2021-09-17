import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { AlertController } from '@ionic/angular';
import { retry } from 'rxjs/operators';
import { BulkUploadService } from 'src/app/services/bulk-upload.service';

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

  constructor(private afStorage: AngularFireStorage, private BUService: BulkUploadService, private alertCtrl: AlertController) { }

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

}
