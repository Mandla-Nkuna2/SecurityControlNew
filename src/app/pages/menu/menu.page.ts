import { Component, OnInit } from '@angular/core';
import { Router, RouterEvent } from '@angular/router';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Storage } from '@ionic/storage';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { LoadingService } from 'src/app/services/loading.service';
import { PushNotificationsService } from 'src/app/services/push-notifications.service';
import { ChatServiceService } from 'src/app/services/chat-service.service';

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
      icon: 'home'
    },
    {
      title: 'FORMS',
      url: '/forms',
      icon: 'clipboard'
    },
    {
      title: 'Form',
      url: '/form',
      icon: 'clipboard'
    },
    {
      title: 'SITES',
      url: '/sites',
      icon: 'globe'
    },
    {
      title: 'STAFF',
      url: '/staff',
      icon: 'people'
    },
    {
      title: 'USERS',
      url: '/users',
      icon: 'person'
    },
    {
      title: 'REPORTS',
      url: '/reports',
      icon: 'cloud-download'
    },
    {
      title: 'MAPPED REPORTS',
      url: '/mapped-reports',
      icon: 'locate'
    },
    {
      title: 'SAVED FORMS',
      url: '/saved-forms',
      icon: 'save'
    },
    {
      title: 'FLEET',
      url: '/fleet',
      icon: 'car'
    },
    {
      title: 'SUMMARIES',
      url: '/site-visit-summary',
      icon: 'pie-chart'
    },
    {
      title: 'BILLING',
      url: '/billing',
      icon: 'card'
    },
    {
      title: 'SETUP',
      url: '/setup',
      icon: 'cog'
    },
    // {
    //   title: 'COST CENTRE',
    //   url: '/cost',
    //   icon: 'card'
    // },
    {
      title: 'SALES CHAT',
      url: '/chat-sales',
      icon: 'pie-chart'
    },
  ];

  pages2 = [
    {
      title: 'FORMS',
      url: '/forms',
      icon: 'clipboard'
    },
    {
      title: 'Form',
      url: '/form',
      icon: 'clipboard'
    },
    {
      title: 'SITES',
      url: '/sites',
      icon: 'globe'
    },
    {
      title: 'STAFF',
      url: '/staff',
      icon: 'people'
    },
    {
      title: 'REPORTS',
      url: '/reports',
      icon: 'cloud-download'
    },
    {
      title: 'SAVED FORMS',
      url: '/saved-forms',
      icon: 'save'
    },
  ];


  pages3 = [
    {
      title: 'WELCOME',
      url: '/welcome',
      icon: 'home'
    },
    {
      title: 'FORMS',
      url: '/forms',
      icon: 'clipboard'
    },
    {
      title: 'Form',
      url: '/form',
      icon: 'clipboard'
    },
    {
      title: 'SITES',
      url: '/sites',
      icon: 'globe'
    },
    {
      title: 'STAFF',
      url: '/staff',
      icon: 'people'
    },
    {
      title: 'REPORTS',
      url: '/reports',
      icon: 'cloud-download'
    },
    {
      title: 'MAPPED REPORTS',
      url: '/mapped-reports',
      icon: 'locate'
    },
    {
      title: 'SAVED FORMS',
      url: '/saved-forms',
      icon: 'save'
    },
    {
      title: 'FLEET',
      url: '/fleet',
      icon: 'car'
    },
    {
      title: 'SUMMARIES',
      url: '/site-visit-summary',
      icon: 'pie-chart'
    },
    {
      title: 'BULK UPLOAD',
      url: '/bulk-upload',
      icon: 'pie-chart'
    },
    {
      title: 'SUPPORT CHAT',
      url: '/chat',
      icon: 'pie-chart'
    },
    {
      title: 'SALES CHAT',
      url: '/chat-sales',
      icon: 'pie-chart'
    },
  ];

  pages4 = [
    {
      title: 'FORMS',
      url: '/forms',
      icon: 'clipboard'
    },
    {
      title: 'Form',
      url: '/form',
      icon: 'clipboard'
    },
    {
      title: 'SITES',
      url: '/sites',
      icon: 'globe'
    },
    {
      title: 'STAFF',
      url: '/staff',
      icon: 'people'
    },
    {
      title: 'REPORTS',
      url: '/reports',
      icon: 'cloud-download'
    },
    {
      title: 'SAVED FORMS',
      url: '/saved-forms',
      icon: 'save'
    },
    {
      title: 'SUPPORT CHAT',
      url: '/chat',
      icon: 'pie-chart'
    },
    {
      title: 'SALES CHAT',
      url: '/chat-sales',
      icon: 'pie-chart'
    },
    {
      title: 'MEMBERSHIP',
      url: '/memberships',
      icon: 'pie-chart'
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

  constructor(private router: Router, private afs: AngularFirestore, private storage: Storage, public loading: LoadingService,
    private pushService: PushNotificationsService, private chatService: ChatServiceService) {
    this.router.events.subscribe((event: RouterEvent) => {
      this.selectedPath = event.url;
    });
  }

  ngOnInit() {
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
        this.companysCollection = this.afs.collection('companys', ref => ref.where('key', '==', user.companyId));
        this.companys = this.companysCollection.snapshotChanges().pipe(map(changes => {
          return changes.map((a: any) => {
            const info = a.payload.doc.data() as any;
            const key = a.payload.doc.id;
            return { key, ...info };
          });
        }));
        this.companys.subscribe(companys => {
          companys.forEach(company => {
            if (company.account === 'Free') {
              this.account = false;
            } else {
              this.account = true;
            }
          });
        });
      });
    });
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
