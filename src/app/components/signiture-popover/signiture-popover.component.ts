import { UiService } from '../../services/ui.service';
import { Component, ViewChild, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { SignaturePad } from 'angular2-signaturepad/signature-pad';


@Component({
  selector: 'app-signiture-pad',
  templateUrl: './signiture-popover.component.html',
  styleUrls: ['./signiture-popover.component.scss'],
})
export class SigniturePadComponent {

  @ViewChild('sigPad') sigPad: SignaturePad;
  @Input() fieldName: any;

  signaturePadOptions: Object = {
    'minWidth': 2,
    'backgroundColor': '#fff',
    'penColor': '#000'
  };

  isDrawing = false;
  signature = ''
  constructor(
    private uiService: UiService
  ) { }

  drawComplete() {
    this.isDrawing = false;
    this.signature = this.sigPad.toDataURL();
  }

  drawStart() {
    this.isDrawing = true;
  }

  clearPad() {
    this.sigPad.clear();
    this.signature = '';
  }

  close() {
    this.uiService.dismissPopover({ [`${this.fieldName}`]: this.signature })
  }
}

