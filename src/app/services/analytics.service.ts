import { Injectable } from '@angular/core';
import { GoogleAnalytics } from '@ionic-native/google-analytics/ngx';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  trackerId = 'UA-168443436-1';
  constructor(private ga: GoogleAnalytics) { }

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
    this.ga.startTrackerWithId(this.trackerId)
      .then(() => {
        this.ga.trackEvent(page, event, label, value).then(() => {
          console.log('tracked')
        });
      })
      .catch(e => {
        console.log('Error starting GoogleAnalytics', e);
      });
  }
}
