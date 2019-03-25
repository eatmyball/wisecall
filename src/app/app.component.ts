import { Autostart } from '@ionic-native/autostart';
import { LocalDbProvider } from './../providers/local-db/local-db';
import { SoapApiProvider } from './../providers/soap-api/soap-api';
import { UtilityProvider, TOAST_POSITION } from './../providers/utility/utility';
import { Component, ViewChild } from '@angular/core';
import { Platform, MenuController, Nav, Events } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
import { FileOpener } from '@ionic-native/file-opener';
@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  @ViewChild(Nav) nav: Nav;

  rootPage:any = HomePage;

  menuListData = [];

  deptName:string = '';
  userName:string = '';
  version:string='';

  constructor(platform: Platform, 
    private statusBar: StatusBar, 
    private splashScreen: SplashScreen, 
    private util:UtilityProvider,
    private menuCtrl:MenuController,
    private events:Events,
    private api:SoapApiProvider,
    private local:LocalDbProvider,
    private autoStart:Autostart,
    private fileOpen:FileOpener
    ) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.statusBar.backgroundColorByHexString('#FE770B');
      this.splashScreen.hide();
      //允许自启动
      this.autoStart.enable();
      this.menuCtrl.enable(false);
      this.initEvents();
      this.version = this.api.version;
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
      this.showUpdateApkAlert();
      // window.open('http://info.liontown.cn/htmprd/apk/wisecall.apk');
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

  listener = (progress)=>{
    let process =  new Number((progress.loaded / progress.total) * 100);
    console.log('下载进度:'+ process + '%');
  }

  showUpdateApkAlert() {
    let filePath = '/storage/emulated/0/Download/wisecall.apk';
    this.util.showAlertWithOkhandler('版本更新','是否下载最新的客户端','取消','确认',(data)=>{
      this.util.showLoading('正在下载中，请稍候...');
      this.util.setDownloadListener(this.listener);
      this.util.fileDownload('http://info.liontown.cn/htmprd/apk/wisecall.apk',filePath).then((fileEntry)=>{
        this.util.dismissLoading();
        console.log('下载成功:'+ JSON.stringify(fileEntry));
        this.fileOpen.open(fileEntry.toURL(),'application/vnd.android.package-archive');
      }).catch(error=>{
        this.util.dismissLoading();
        console.log('下载失败:'+ JSON.stringify(error, Object.getOwnPropertyNames(error)));
      });
    });
  }

}

