import { UiService } from './../../services/ui.service';
import { Component, OnInit } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import moment from 'moment';
import { MembershipService } from 'src/app/services/membership.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-memberships',
  templateUrl: './memberships.page.html',
  styleUrls: ['./memberships.page.scss'],
})
export class MembershipsPage implements OnInit {

  accessType;
  basic = { title: '', price: '', access: [], id: '' };
  premium = { title: '', price: '', access: [], id: '' };
  enterprise = { title: '', price: '', access: [], id: '' };
  user;
  company;
  membership;
  packages =[];

  constructor(
    private storage: Storage,
    private alertCtrl: AlertController,
    private toast: ToastService,
    private membershipService: MembershipService,
    private uiService : UiService,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
    this.membershipService.getMembershipPackages().then((packages: any[]) => {
      this.packages = packages;
      packages.forEach((pack: any) => {
        if (pack.title === 'Basic') {
          this.basic = pack;
        } else if (pack.title === 'Premium') {
          this.premium = pack;
        } else {
          this.enterprise = pack;
        }
      })
      this.storage.get('user').then(user => {
        this.user = user;
        this.membershipService.getMembershipDetails(user.companyId).then((membership)=>{
          this.membership = membership;
          this.membershipService.getCompany(user.companyId).then((comp: any) => {
            this.company = comp;
            console.log(this.company.accessType)
            if (comp.accessType && comp.accessType !== '') {
              this.accessType = comp.accessType;
            } else {
              this.accessType = '';
            }
          })
        })
      })
    })
  }

  async cancel() {
    const alert = await this.alertCtrl.create({
      header: 'Cancel Subscription',
      message: 'Are you sure you want to delete your subscription to Security Control? We will only store your data for 14 days. After this time your account will be deleted',
      buttons: [
        {
          text: 'EXIT',
          handler: data => {
          }
        },
        {
          text: 'CANCEL SUBSCRIPTION',
          handler: data => {
            this.uiService.showLoading("Please wait..")
            this.membershipService.cancelSubscription(this.membership.subscriptionCode, this.membership.emailToken).then(()=>{
              this.uiService.dismissLoading();
              this.uiService.showToaster("Subscription Cancelled", "success", 3000)
            }).catch((onError)=>{
              console.log(onError)
              this.uiService.showToaster("Something went wrong", "danger", 2000)
            })
          }
        }
      ]
    })
    return alert.present();
  }

  upgradeOrDowngrade(chosenTier, isDowngrade){
    let chosenPlan = this.packages.find(x => x.title == chosenTier);
    this.uiService.openConfirmationAlert(
      `You are about to ${isDowngrade ? 'downgrade' : 'upgrade'} to the ${chosenTier} plan, are you sure?`, 'Yes', 'No'
    ).then((confirmed) => {
      if (confirmed) {
        this.uiService.showLoading("Please wait ...")
        this.membershipService.upgradeOrDowngrade(
          chosenPlan.title,
          isDowngrade,
          chosenPlan.price,
          this.membership.companyKey,
          this.membership.nextPaymentDate,
          this.membership.customerCode,
          this.membership.authCode,
          this.membership.emailToken,
          this.user.email,
          chosenPlan.planCode
        ).then(() => {
          this.uiService.dismissLoading();
          this.uiService.showToaster("Subscription changed successfully", "success", 2000)
        }).catch((onError) => {
          this.uiService.showToaster("Something went wrong", "danger", 2000)
          this.uiService.dismissLoading();
          console.log(onError)
        })
      }
    })
    
  }

  //to be refactored
  onSelect(plan){
    let chosenPlan = this.packages.find(x => x.title == plan);
    let isDowngrade;
    if(this.accessType){
      let currentPlan = this.packages.find(x=>x.title == this.accessType)
      if(currentPlan.rank<chosenPlan.rank){
        isDowngrade=false;
      }else{
        isDowngrade=true;
      }
      this.upgradeOrDowngrade(plan, isDowngrade);
    }else{
    this.uiService.openConfirmationAlert(`You are about to get the ${plan} membership which comes with a free 14-day trial, are you sure?`,"Yes", "No").then((confirmed)=>{
      if(confirmed){
        this.uiService.showLoading("Please wait...")
        this.membershipService.checkForCardAuth(this.user.key).then((cardAuth: any)=>{
          if(cardAuth){
            this.membershipService.startTrial(
              this.user.companyId, 
              this.user.customerCode, 
              cardAuth.authorization_code, 
              chosenPlan.price*100, //paystack uses cents , so * 100
              chosenPlan.planCode, 
              plan
              ).then(()=>{
                this.uiService.dismissLoading();
                this.navCtrl.navigateRoot('welcome');
                this.uiService.showToaster("Subscribed successfully!", "success", 3000);
              })
          }else{
            this.uiService.dismissLoading();
            this.uiService.showToaster("Add a card to complete the subscription", "primary", 4000)
            this.uiService.openPaymentModal(this.user).then(()=>{
              this.uiService.modalDismissal().then((items)=>{
                if(items.data.authCode){
                  this.uiService.showLoading("Please wait...")
                  this.membershipService.startTrial(
                    this.user.companyId, 
                    this.user.customerCode, 
                    items.data.authCode,
                    (chosenPlan.price*100) - 300, 
                    chosenPlan.planCode, 
                    plan
                    ).then(()=>{
                      this.uiService.dismissLoading();
                      this.navCtrl.navigateRoot('welcome');
                      this.uiService.showToaster("Subscribed successfully!", "success", 3000);
                    })
                }else if(items.data=="FAILED"){
                  this.navCtrl.navigateRoot('welcome');
                  this.uiService.showToaster("Something went wrong", "danger", 3000);
                }
              })
            })
          }
        })
      }
    })
    }
  }

  async enterpriseContact() {
    const alert = await this.alertCtrl.create({
      header: 'Enterprise inquiry',
      message: 'Would you like to contact us about upgrading to Enterprise?',
      buttons: [
        {
          text: 'CANCEL',
          handler: data => {
          }
        },
        {
          text: 'SEND INQUIRY',
          handler: data => {
            var inq = {
              company: this.user.company,
              companyId: this.user.companyId,
              user: this.user.name,
              userEmail: this.user.email,
              userId: this.user.key,
              date: moment(new Date()).format('YYYY/MM/DD HH:mm'),
            }
            this.membershipService.setEnterpriseInquiry(inq.companyId, inq).then(() => {
              this.toast.show('Your inquiry has been sent. Someone from our team will be contacting you soon!')
            })
          }
        }
      ]
    })
    return alert.present();
  }

}
