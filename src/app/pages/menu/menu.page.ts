import { Component, OnInit } from '@angular/core';
import { Router, RouterEvent } from '@angular/router';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Storage } from '@ionic/storage';
import { Observable, Subscription } from 'rxjs';
import { LoadingService } from 'src/app/services/loading.service';
import { PushNotificationsService } from 'src/app/services/push-notifications.service';
import { ChatServiceService } from 'src/app/services/chat-service.service';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
})
export class MenuPage implements OnInit {

  pages1 = [
    {
      title: 'WELCOME',
      url: '/welcome',
      condition: 'this.permission && !this.technician && this.access && !this.app',
      icon: 'home'
    },
    {
      title: 'FORMS',
      url: '/forms',
      condition: 'this.permission && !this.technician && this.access && !this.app',
      icon: 'clipboard'
    },
    {
      title: 'Form',
      url: '/form-menu',
      condition: 'this.permission && !this.technician && this.access && !this.app',
      icon: 'clipboard'
    },
    {
      title: 'SITES',
      url: '/sites',
      condition: 'this.permission && !this.technician && this.access && !this.app',
      icon: 'globe'
    },
    {
      title: 'STAFF',
      url: '/staff',
      condition: 'this.permission && !this.technician && this.access && !this.app',
      icon: 'people'
    },
    {
      title: 'USERS',
      url: '/users',
      condition: 'this.permission && !this.technician && this.access && !this.app',
      icon: 'person'
    },
    {
      title: 'REPORTS',
      url: '/reports',
      condition: 'this.permission && !this.technician && this.access && !this.app',
      icon: 'cloud-download'
    },
    {
      title: 'MAPPED REPORTS',
      url: '/mapped-reports',
      condition: 'this.permission && !this.technician && this.access && !this.app',
      icon: 'locate'
    },
    {
      title: 'SAVED FORMS',
      url: '/saved-forms',
      condition: 'this.permission && !this.technician && this.access && !this.app',
      icon: 'save'
    },
    {
      title: 'FLEET',
      url: '/fleet',
      condition: 'this.permission && !this.technician && this.access && !this.app',
      icon: 'car'
    },
    {
      title: 'SUMMARIES',
      url: '/site-visit-summary',
      condition: 'this.permission && !this.technician && this.access && !this.app',
      icon: 'pie-chart'
    },
    {
      title: 'BILLING',
      url: '/billing',
      condition: 'this.permission && !this.technician && this.access && !this.app',
      icon: 'card'
    },
    {
      title: 'SETUP',
      url: '/setup',
      condition: 'this.permission && !this.technician && this.access && !this.app',
      icon: 'cog'
    },
    {
      title: 'SALES CHAT',
      url: '/chat-sales',
      condition: 'this.permission && !this.technician && this.access && !this.app',
      icon: 'pie-chart'
    },
    {
      title: 'MEMBERSHIP',
      url: '/memberships',
      condition: 'this.permission && !this.technician && this.access && !this.app',
      icon: 'pie-chart'
    },
  ];

  pages2 = [
    {
      title: 'FORMS',
      url: '/forms',
      condition: 'this.permission && !this.technician && this.access && this.app',
      icon: 'clipboard'
    },
    {
      title: 'Form',
      url: '/form-menu',
      condition: 'this.permission && !this.technician && this.access && this.app',
      icon: 'clipboard'
    },
    {
      title: 'SITES',
      url: '/sites',
      condition: 'this.permission && !this.technician && this.access && this.app',
      icon: 'globe'
    },
    {
      title: 'STAFF',
      url: '/staff',
      condition: 'this.permission && !this.technician && this.access && this.app',
      icon: 'people'
    },
    {
      title: 'REPORTS',
      url: '/reports',
      condition: 'this.permission && !this.technician && this.access && this.app',
      icon: 'cloud-download'
    },
    {
      title: 'SAVED FORMS',
      url: '/saved-forms',
      condition: 'this.permission && !this.technician && this.access && this.app',
      icon: 'save'
    },
    {
      title: 'WELCOME',
      url: '/welcome',
      condition: '!this.permission && !this.technician && this.access && !this.app',
      icon: 'home'
    },
    {
      title: 'FORMS',
      url: '/forms',
      condition: '!this.permission && !this.technician && this.access && !this.app',
      icon: 'clipboard'
    },
    {
      title: 'Form',
      url: '/form-menu',
      condition: '!this.permission && !this.technician && this.access && !this.app',
      icon: 'clipboard'
    },
    {
      title: 'SITES',
      url: '/sites',
      condition: '!this.permission && !this.technician && this.access && !this.app',
      icon: 'globe'
    },
    {
      title: 'STAFF',
      url: '/staff',
      condition: '!this.permission && !this.technician && this.access && !this.app',
      icon: 'people'
    },
    {
      title: 'REPORTS',
      url: '/reports',
      condition: '!this.permission && !this.technician && this.access && !this.app',
      icon: 'cloud-download'
    },
    {
      title: 'MAPPED REPORTS',
      url: '/mapped-reports',
      condition: '!this.permission && !this.technician && this.access && !this.app',
      icon: 'locate'
    },
    {
      title: 'SAVED FORMS',
      url: '/saved-forms',
      condition: '!this.permission && !this.technician && this.access && !this.app',
      icon: 'save'
    },
    {
      title: 'FLEET',
      url: '/fleet',
      condition: '!this.permission && !this.technician && this.access && !this.app',
      icon: 'car'
    },
    {
      title: 'SUMMARIES',
      url: '/site-visit-summary',
      condition: '!this.permission && !this.technician && this.access && !this.app',
      icon: 'pie-chart'
    },
    {
      title: 'BULK UPLOAD',
      url: '/bulk-upload',
      condition: '!this.permission && !this.technician && this.access && !this.app',
      icon: 'pie-chart'
    },
    {
      title: 'FORM UPLOAD',
      url: '/form-upload',
      condition: '!this.permission && !this.technician && this.access && !this.app',
      icon: 'pie-chart'
    },
    {
      title: 'SUPPORT CHAT',
      url: '/chat',
      condition: '!this.permission && !this.technician && this.access && !this.app',
      icon: 'pie-chart'
    },
    {
      title: 'SALES CHAT',
      url: '/chat-sales',
      condition: '!this.permission && !this.technician && this.access && !this.app',
      icon: 'pie-chart'
    },
    {
      title: 'MEMBERSHIP',
      url: '/memberships',
      condition: '!this.permission && !this.technician && this.access && !this.app',
      icon: 'pie-chart'
    },
    {
      title: 'FORMS',
      url: '/forms',
      condition: '!this.permission && !this.technician && this.access && this.app',
      icon: 'clipboard'
    },
    {
      title: 'Form',
      url: '/form-menu',
      condition: '!this.permission && !this.technician && this.access && this.app',
      icon: 'clipboard'
    },
    {
      title: 'SITES',
      url: '/sites',
      condition: '!this.permission && !this.technician && this.access && this.app',
      icon: 'globe'
    },
    {
      title: 'STAFF',
      url: '/staff',
      condition: '!this.permission && !this.technician && this.access && this.app',
      icon: 'people'
    },
    {
      title: 'REPORTS',
      url: '/reports',
      condition: '!this.permission && !this.technician && this.access && this.app',
      icon: 'cloud-download'
    },
    {
      title: 'SAVED FORMS',
      url: '/saved-forms',
      condition: '!this.permission && !this.technician && this.access && this.app',
      icon: 'save'
    },
    {
      title: 'SUPPORT CHAT',
      url: '/chat',
      condition: '!this.permission && !this.technician && this.access && this.app',
      icon: 'pie-chart'
    },
    {
      title: 'SALES CHAT',
      url: '/chat-sales',
      condition: '!this.permission && !this.technician && this.access && this.app',
      icon: 'pie-chart'
    },
    {
      title: 'MEMBERSHIP',
      url: '/memberships-app',
      condition: '!this.permission && !this.technician && this.access && this.app',
      icon: 'pie-chart'
    },
    {
      title: 'No Access',
      url: '/no-access',
      condition: '!this.permission && !this.technician && !this.access && this.app',
      icon: 'clipboard'
    },
    {
      title: 'TECHNICAL JOB CARDS',
      url: '/work-orders',
      condition: 'this.thompsons || this.technician',
      icon: 'clipboard'
    },
  ];


  selectedPath = '';
  screen;
  app = true;
  companysCollection: AngularFirestoreCollection<any>;
  companys: Observable<any[]>;
  account: boolean = true;
  user = { photo: '', type: '', companyId: '', };

  permission: boolean = false;
  technician = false;

  thompsons = false;

  salesCount = 0;
  salesCountSub: Subscription;
  supportCount = 0;
  supportCountSub: Subscription

  access = true;

  constructor(private router: Router, private afs: AngularFirestore, private storage: Storage, public loading: LoadingService,
    private pushService: PushNotificationsService, private chatService: ChatServiceService, private authService: AuthenticationService) {
    this.router.events.subscribe((event: RouterEvent) => {
      this.selectedPath = event.url;
    });
  }

  checkAccess() {
    return this.storage.get('user').then((user) => {
      return this.authService.checkCompanyAccess(user).then(access => {
        if (access === true) {
          return true;
        } else {
          this.access = false;
          this.router.navigate(['no-access'])
        }
      })
    })
  }
  evaluate(condition: string) {
    return eval(condition);
  }
  ngOnInit() {
    this.checkAccess().then(access => {
      if (access === true) {
        this.screen = window.innerWidth;
        if (window.innerWidth > 1024) {
          this.app = false;
        } else {
          this.app = true;
          this.getToken();
        }
        this.storage.get('user').then((user) => {
          this.getSalesCount(user);
          this.getSupportCount(user);
          this.user.photo = user.photo;
          this.user.type = user.type;
          this.thompsonCheck().then(() => {
            this.user.companyId = user.companyId;
            if (this.user.type === 'Owner' || this.user.type === 'Admin' || this.user.type === 'Account Admin') {
              this.permission = true;
            } else {
              this.permission = false;
            }
            if (this.user.type === 'Technician') {
              this.router.navigate(['work-orders'])
              this.technician = true;
            } else {
              this.technician = false;
            }
          });
        });
      }
    })
  }

  getSalesCount(user) {
    this.salesCountSub = this.chatService.getSalesCount(user).subscribe((res: any) => {
      this.salesCount = res;
    })
  }

  getSupportCount(user) {
    this.supportCountSub = this.chatService.getSupportCount(user).subscribe((res: any) => {
      this.supportCount = res;
    })
  }

  getToken() {
    this.storage.get('user').then(user => {
      this.pushService.getToken(user);
    });
  }

  thompsonCheck() {
    return new Promise<void>((resolve, reject) => {
      this.storage.get('user').then((user) => {
        if (user.companyId === '0qbfVjnyuKE8EAdenn3T') {
          this.thompsons = true;
        } else {
          this.thompsons = false;
        }
        resolve();
      });
    });
  }

  upgrade() {
    this.loading.present('Opening Please Wait...').then(() => {
      this.router.navigate(['subscribe']).then(() => {
        this.loading.dismiss();
      });
    });
  }

}
