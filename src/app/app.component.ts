import { UtilityProvider, TOAST_POSITION } from './../providers/utility/utility';
import { Component, ViewChild } from '@angular/core';
import { Platform, MenuController, Nav } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  @ViewChild(Nav) nav: Nav;

  rootPage:any = HomePage;

  menuListData = [];

  constructor(platform: Platform, 
    private statusBar: StatusBar, 
    private splashScreen: SplashScreen, 
    private util:UtilityProvider,
    private menuCtrl:MenuController
    ) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.statusBar.backgroundColorByHexString('#0070E0');
      this.splashScreen.hide();
      this.menuCtrl.enable(false);
    });

    this.initMenuList();
  }

  initMenuList() {
    this.menuListData = [
      {name:'运送',icon:'ios-paper',page:''},
      {name:'报修',icon:'ios-construct',page:''},
      {name:'建议',icon:'ios-chatboxes',page:''},
      {name:'帮助',icon:'ios-help-circle',page:''},
      {name:'退出',icon:'ios-log-out',page:''},
    ];
    
  }

  openPage(pageName:string) {
    if(pageName) {
      this.nav.setRoot(pageName);
    }else {
      this.util.showToast('功能建设中！', TOAST_POSITION.MIDDLE);
    }
  }
}

