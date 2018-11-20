import { TaskListPage } from './../../pages/task-list/task-list';
import { Platform, App, ToastController, NavController } from 'ionic-angular';
import { Injectable } from '@angular/core';

/*
  Generated class for the BackkeyProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class BackkeyProvider {

  //控制硬件返回按钮是否触发，默认false
  backButtonPressed: boolean = false;

  constructor(private platform:Platform,
      private app:App,
      public toastCtrl:ToastController,
    ) {
    console.log('Hello BackkeyProvider Provider');
  }

  //注册方法
  registerBackButtonAction(): void {

    this.platform.registerBackButtonAction(() => {

      let activeNav: NavController = this.app.getActiveNav();
      //如果可以返回上一页，则执行pop
      if (activeNav.canGoBack()) {
        activeNav.pop();
      } else {
        let page = activeNav.getActive().instance;
        if(page instanceof TaskListPage) {
          this.showExit();
        }else {
          activeNav.pop();
        }
      }
    });
  }

    //退出应用方法
    private showExit(): void {
      if (this.backButtonPressed) {
        this.platform.exitApp();
      } else {
        this.toastCtrl.create({
          message: '再点击一次返回键退出',
          duration: 2000,
          position: 'bottom'
        }).present();
        this.backButtonPressed = true;
        setTimeout(() => this.backButtonPressed = false, 2000);
      }
    }

}
