import { ReactiveFormsModule } from '@angular/forms';
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AngularFireModule } from '@angular/fire';
import { AngularFireStorageModule } from '@angular/fire/storage'
import { AngularFireAuthModule } from '@angular/fire/auth';
import { FIREBASE_CONFIG } from './app.firebase.config';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { Camera } from '@ionic-native/camera/ngx';
import { File } from '@ionic-native/file/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { ToastService } from './services/toast.service';
import { PdfService } from './services/pdf.service';
import { AuthGuardService } from './services/auth-guard.service';
import { AuthenticationService } from './services/authentication.service';
import { IonicStorageModule } from '@ionic/storage';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { UpdateBillingPageModule } from './pages/update-billing/update-billing.module';
import { AddEmailPageModule } from './pages/add-email/add-email.module';
import { EditMyAccountPageModule } from './pages/edit-my-account/edit-my-account.module';
import { AddNewsPageModule } from './pages/add-news/add-news.module';
import { AddSiteToUserPageModule } from './pages/add-site-to-user/add-site-to-user.module';
import { MapReportDetailsPageModule } from './pages/map-report-details/map-report-details.module';
import { WorkOrderPageModule } from './pages/work-order/work-order.module';
import { ImageCropperModule } from 'ngx-image-cropper';
import { ViewOrderPageModule } from './pages/view-order/view-order.module';
import { CameraService } from './services/camera.service';
import { HttpClientModule } from '@angular/common/http';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';
import { ComponentsModule } from './components/components.module'
import { pdfService2 } from './services/pdf-service2.service'
@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicStorageModule.forRoot(),
    IonicModule.forRoot(),
    AngularFireModule.initializeApp(FIREBASE_CONFIG),
    AngularFirestoreModule.enablePersistence(),
    AngularFireAuthModule,
    AngularFireStorageModule,
    AppRoutingModule,
    UpdateBillingPageModule,
    AddEmailPageModule,
    EditMyAccountPageModule,
    ImageCropperModule,
    AddNewsPageModule,
    AddSiteToUserPageModule,
    MapReportDetailsPageModule,
    WorkOrderPageModule,
    ViewOrderPageModule,
    ReactiveFormsModule,
    HttpClientModule,
    ComponentsModule
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    Camera,
    File,
    FileOpener,
    ToastService,
    PdfService,
    CameraService,
    AuthGuardService,
    AuthenticationService,
    Geolocation,
    InAppBrowser,
    FirebaseX,
    pdfService2,
  ],
  bootstrap: [AppComponent],
  schemas: [NO_ERRORS_SCHEMA]
})
export class AppModule { }
