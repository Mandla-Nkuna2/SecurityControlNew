import { Component, OnInit } from '@angular/core';
import { NavParams, LoadingController, AlertController, ModalController, NavController } from '@ionic/angular';
import { PdfService } from 'src/app/services/pdf.service';

@Component({
  selector: 'app-map-report-details',
  templateUrl: './map-report-details.page.html',
  styleUrls: ['./map-report-details.page.scss'],
})
export class MapReportDetailsPage implements OnInit {

  report;

  constructor(public navCtrl: NavController, public modalCtrl: ModalController, private navParams: NavParams,
    public PdfService: PdfService) {
  }

  ngOnInit() {
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

  download() {
    this.PdfService.download(this.report).then(() => {
      this.closeModal();
    });
  }

}

