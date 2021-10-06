import { UiService } from './../../services/ui.service';
import { MembershipService } from './../../services/membership.service';
import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
})
export class PaymentComponent implements OnInit {
  @Input() user: any;
  loading=false;
  isOpen=false;
  authUrl;
  purchaseAmount=3;//will always be 3 since this component is only used for adding cards

  constructor(
    private membershipService: MembershipService,
    private sanitizer: DomSanitizer,
    private uiService: UiService
  ) { }

  ngOnInit() {}

  onCancel(){
    this.uiService.dismissModal();
  }

  onPay(){
    this.loading = true;
    this.membershipService.initializePayment(this.user.email.toLowerCase(),300).then((onResponse: any)=>{
      let reference = onResponse.data.reference;
      this.isOpen=true;
      this.authUrl = this.sanitizer.bypassSecurityTrustResourceUrl(onResponse.data.authorization_url);
      this.membershipService.subToPaymentEvent(reference).then((event: any)=>{
        if(event){
          this.membershipService.saveCardAuth(this.user.key, event.data.authorization).then(()=>{
            this.loading=false;
            this.uiService.dismissModal();
            this.uiService.showToaster("Card added successfully", "success", 3000)
          })
        }else {
          this.loading= false;
          this.uiService.dismissModal();
          this.uiService.showToaster("Payment Failed", "danger", 3000)
        }
      })
    })
  }

}
