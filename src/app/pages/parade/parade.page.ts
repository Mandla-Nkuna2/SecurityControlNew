import { Component, OnInit } from '@angular/core';
import { NavController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-parade',
  templateUrl: './parade.page.html',
  styleUrls: ['./parade.page.scss'],
})
export class ParadePage implements OnInit {

  parade = { key: '', date: '', time: '', user: '', userkey: '', site: '', siteKey: '', shift: '' };

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ngOnInit() {
    console.log('ionViewDidLoad ParadePage');
  }

}

