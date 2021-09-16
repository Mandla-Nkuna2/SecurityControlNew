import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { NavParams, PopoverController } from '@ionic/angular';
import { SignaturePad } from 'angular2-signaturepad/signature-pad';


@Component({
  selector: 'app-popover',
  templateUrl: './popover.component.html',
  styleUrls: ['./popover.component.scss'],
})


export class PopoverComponent implements OnInit {


  @ViewChild('sigPad') sigPad: SignaturePad;


  signaturePadOptions: Object = { // passed through to szimek/signature_pad constructor
    'minWidth': 2,
    'backgroundColor': '#fff',
    'penColor': '#000'
  };

  items;
  isDrawing = false;
  signatu = ''
  constructor(public popover: PopoverController,  public navparams: NavParams) { }


  drawComplete() {
    this.isDrawing = false;
    this.signatu = this.sigPad.toDataURL();
  }

  drawStart() {
    this.isDrawing = true;
  }

  clearPad() {
  this.sigPad.clear();
   this.signatu = '';
  }
  ngOnInit() {
   
    this.navparams.data.items;
  }

  close() {
  
    this.popover.dismiss({out:this.signatu, for: this.navparams.data.items})

  }



}

