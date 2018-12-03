import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { IonicStorageModule } from '@ionic/storage';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { UtilityProvider } from '../providers/utility/utility';
import { ApiProvider } from '../providers/api/api';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { BackkeyProvider } from '../providers/backkey/backkey';
import { HttpModule } from '@angular/http';
import { SoapApiProvider } from '../providers/soap-api/soap-api';
import { LocalDbProvider } from '../providers/local-db/local-db';
import { Autostart } from '@ionic-native/autostart';


@NgModule({
  declarations: [
    MyApp,
    HomePage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp, {
      tabsHideOnSubPages: "true", // nav在push的时候隐藏
      tabs: '',   
      iconMode: 'ios',
      mode: 'ios', //样式选择ios模式，以便统一客户端样式
      backButtonText: '',
      scrollPadding: false,
      scrollAssist: true,
      autoFocusAssit: false
    }),
    HttpModule,
    IonicStorageModule.forRoot({
      name: 'my_storage',
      driverOrder: ['indexeddb', 'sqlite', 'websql']
    }),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    UtilityProvider,
    ApiProvider,
    Camera,
    BackkeyProvider,
    SoapApiProvider,
    LocalDbProvider,
    Autostart
  ]
})
export class AppModule {}
