import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { UtilityProvider } from '../providers/utility/utility';
import { ApiProvider } from '../providers/api/api';
import { PhotoViewer } from '@ionic-native/photo-viewer';
import { Camera, CameraOptions } from '@ionic-native/camera';


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
      scrollPadding: false,
      scrollAssist: true,
      autoFocusAssit: false
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
    PhotoViewer,
    Camera
  ]
})
export class AppModule {}
