import { Injectable } from '@angular/core';
import { GoogleAnalytics } from '@ionic-native/google-analytics/ngx';
import { Platform } from '@ionic/angular';
declare let gtag: Function;

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  trackerId = 'G-0F1C81YWSV';
  constructor(private ga: GoogleAnalytics, private platform: Platform) { }

  public trackView(page: string) {
    this.ga.startTrackerWithId(this.trackerId)
      .then(() => {
        this.ga.trackView(page).then(() => {
          console.log('tracked')
        });
      })
      .catch(e => {
        console.log('Error starting GoogleAnalytics', e);
      });
  }
  public trackEvent(page: string, event: string, label?: string, value?: any) {
    if (this.platform.is('cordova')) {
      this.trackEventApp(page, event, label, value);
    } else {
      this.trackEventWeb(page, event, label, value);
    }
  }

  trackEventApp(page: string, event: string, label?: string, value?: any) {
    this.ga.startTrackerWithId(this.trackerId)
      .then(() => {
        this.ga.trackEvent('App: ' + page, event, label, value).then(() => {
          console.log('App Tracked')
        });
      })
      .catch(e => {
        console.log('Error starting GoogleAnalytics', e);
      });
  }

  trackEventWeb(page: string, event: string, label?: string, value?: any) {
    gtag('event', page, {
      eventCategory: 'Web: ' +page,
      eventLabel: label,
      eventAction: event,
      eventValue: value
    })
    console.log('Web Event Fired')
  }
}
