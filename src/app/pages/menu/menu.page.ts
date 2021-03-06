import { MembershipService } from './../../services/membership.service';
import { Component, OnInit } from '@angular/core';
import { Router, RouterEvent } from '@angular/router';
import { AngularFirestoreCollection } from '@angular/fire/firestore';
import { Storage } from '@ionic/storage';
import { Observable, Subscription } from 'rxjs';
import { LoadingService } from 'src/app/services/loading.service';
import { PushNotificationsService } from 'src/app/services/push-notifications.service';
import { ChatServiceService } from 'src/app/services/chat-service.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { FormServiceService } from 'src/app/services/form-service.service';
import { Platform } from '@ionic/angular';
import { UiService } from 'src/app/services/ui.service';

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
      icon: 'documents'
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
      title: 'SETUP',
      url: '/setup',
      condition: 'this.permission && !this.technician && this.access && !this.app',
      icon: 'cog'
    },
    {
      title: 'BULK UPLOAD',
      url: '/bulk-upload',
      condition: 'this.permission && !this.technician && this.access && !this.app',
      icon: 'pie-chart'
    },
    {
      title: 'FORM UPLOAD',
      url: '/form-upload',
      condition: 'this.permission && !this.technician && this.access && !this.app',
      icon: 'pie-chart'
    },
    {
      title: 'SUPPORT CHAT',
      url: '/chat',
      condition: 'this.permission && !this.technician && this.access && !this.app',
      icon: 'chatbubbles'
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
      icon: 'diamond'
    },
    {
      title: 'FORMS',
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
      icon: 'documents'
    },
    {
      title: 'SAVED FORMS',
      url: '/saved-forms',
      condition: 'this.permission && !this.technician && this.access && this.app',
      icon: 'save'
    },
    {
      title: 'SUPPORT CHAT',
      url: '/chat',
      condition: 'this.permission && !this.technician && this.access && this.app',
      icon: 'chatbubbles'
    },
    // {
    //   title: 'SALES CHAT',
    //   url: '/chat-sales',
    //   condition: 'this.permission && !this.technician && this.access && this.app',
    //   icon: 'pie-chart'
    // },
    {
      title: 'MEMBERSHIP',
      url: '/memberships-app',
      condition: 'this.permission && !this.technician && this.access && this.app',
      icon: 'diamond'
    },
    {
      title: 'WELCOME',
      url: '/welcome',
      condition: '!this.permission && !this.technician && this.access && !this.app',
      icon: 'home'
    },
    {
      title: 'FORMS',
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
      title: 'SUPPORT CHAT',
      url: '/chat',
      condition: '!this.permission && !this.technician && this.access && !this.app',
      icon: 'pie-chart'
    },
    // {
    //   title: 'SALES CHAT',
    //   url: '/chat-sales',
    //   condition: '!this.permission && !this.technician && this.access && !this.app',
    //   icon: 'pie-chart'
    // },
    {
      title: 'FORMS',
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
    // {
    //   title: 'SALES CHAT',
    //   url: '/chat-sales',
    //   condition: '!this.permission && !this.technician && this.access && this.app',
    //   icon: 'pie-chart'
    // },
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
  email = ''
  access = true;

  constructor(
    private router: Router,
    private storage: Storage,
    public loading: LoadingService,
    private platfrom: Platform,
    private uiService: UiService,
    private pushService: PushNotificationsService, private chatService: ChatServiceService, private authService: AuthenticationService,
    private formsService: FormServiceService) {
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
    this.initialize();
    this.refesh();
  }
  initialize() {
    this.checkAccess().then(res => {
      if (res === true) {
        this.screen = window.innerWidth;
        if (window.innerWidth > 1024) {
          this.app = false;
        } else {
          this.app = true;
          this.getToken();
        }
        this.storage.get('user').then((user) => {
          this.formsUpdate(user);
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
          })
        })
      }
    })
  }
  async refesh() {
    this.uiService.refreshMenu.subscribe(() => {
      this.initialize();
    })
  }

  formsUpdate(user) {
    this.formsService.checkForUpdates(user.companyId);
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

}
