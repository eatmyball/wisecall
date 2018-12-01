import { LocalDbProvider } from './../providers/local-db/local-db';
import { SoapApiProvider } from './../providers/soap-api/soap-api';
import { UtilityProvider, TOAST_POSITION } from './../providers/utility/utility';
import { Component, ViewChild } from '@angular/core';
import { Platform, MenuController, Nav, Events } from 'ionic-angular';
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

  deptName:string = '';
  userName:string = '';

  constructor(platform: Platform, 
    private statusBar: StatusBar, 
    private splashScreen: SplashScreen, 
    private util:UtilityProvider,
    private menuCtrl:MenuController,
    private events:Events,
    private api:SoapApiProvider,
    private local:LocalDbProvider
    ) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.statusBar.backgroundColorByHexString('#0070E0');
      this.splashScreen.hide();
      this.menuCtrl.enable(false);
      this.initEvents();
    });

    this.initMenuList();
  }

  initMenuList() {
    this.menuListData = [
      {name:'运送',icon:'ios-paper',page:'TaskListPage'},
      {name:'报修',icon:'ios-construct',page:''},
      {name:'建议',icon:'ios-chatboxes',page:''},
      {name:'帮助',icon:'ios-help-circle',page:''},
      {name:'更新',icon:'ios-information-circle',page:''},
      {name:'登出',icon:'ios-log-out',page:''},
    ];
    
  }

  openPage(page:string) {
    if(page['name'] === '登出') {
      this.local.save('account','');
      this.local.save('password','');
      this.nav.setRoot(HomePage);
      return;
    }
    else if(page['name'] === '更新') {
      window.open('about:blank');
      return;
    }
    else {
      let pagename = page['page'];
      if(pagename) {
        this.nav.setRoot(pagename);
      }else {
        this.util.showToast('功能建设中！', TOAST_POSITION.MIDDLE);
      }
    }
  }

  initEvents() {
    this.events.subscribe('USER_LOGIN_SUCCESS',()=>{
      this.deptName = this.api.userInfo['DeptName'];
      this.userName = this.api.userInfo['Name'];
    })
  }

}

