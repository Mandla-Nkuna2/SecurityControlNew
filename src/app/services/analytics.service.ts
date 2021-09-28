import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';
import { AnalyticsEvent, AnalyticsScreenView } from '../models/analytics.model';

declare let gtag: Function;

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  trackerId = 'G-0F1C81YWSV';
  constructor(private platform: Platform, private firebaseX: FirebaseX) { }

  public logAnalyticsEvent(event, param) {
    if (this.platform.is('cordova')) {
      this.logEventApp(event, param);
    } else {
      this.logEventWeb(event, param);
    }
  }

  public async logEventApp(
    event: AnalyticsEvent,
    param: AnalyticsScreenView
  ) {
    console.log('log event');
    console.log(event);
    console.log(param);
    await this.firebaseX.logEvent(event, param);
  }

  logEventWeb(event: AnalyticsEvent, param: AnalyticsScreenView) {
    gtag('event', event, {
      page_title: param.screen_name,
      page_location: param.screen_class,
      page_path: param.screen_class,
      send_to: 'G-0F1C81YWSV'
    })
  }

  trackViewWeb(pageTitle, path) {
    gtag('event', 'page_view', {
      page_title: pageTitle,
      page_location: path,
      page_path: path,
      send_to: 'G-0F1C81YWSV'
    })
  }

  trackEventWeb(page: string, event: string, label?: string, value?: any) {
    gtag('event', 'action_click', {
      eventCategory: 'Web: ' + page,
      eventLabel: label,
      eventAction: event,
      eventValue: value
    })
    console.log('Web Event Fired')
  }
}
