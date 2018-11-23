import { LocalDbProvider } from './../../providers/local-db/local-db';
import { UtilityProvider } from './../../providers/utility/utility';
import { Component } from '@angular/core';
import { NavController, Events } from 'ionic-angular';
import { SoapApiProvider } from '../../providers/soap-api/soap-api';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  username:string = '';
  password:string = '';

  constructor(public navCtrl: NavController,
    private api:SoapApiProvider,
    private util:UtilityProvider,
    private events:Events,
    private local:LocalDbProvider
    ) {

  }

  ionViewDidLoad(){
    this.initLoginInfo();
  }

  initLoginInfo() {
    this.local.getValue('account').then(data=>{
      this.username = data;
    });
    this.local.getValue('password').then(data=>{
      this.password = data;
    });
    setTimeout(() => {
      if(this.username&&this.password) {
        //自动登录
        this.onLoginClicked();
      }
    }, 300);
  }

  onLoginClicked() {
    this.util.showLoading('正在登录中,请稍候...');

    setTimeout(() => {
      this.api.userLogin({'Account':this.username, 'Password':this.password}).then(data=>{
        this.util.dismissLoading();
        if(data['Flag'] === 'S') {
          //保存用户名密码
          this.local.save('account', this.username);
          this.local.save('password', this.password);
          this.api.setUserInfo(data['dsData']['Table1'][0]);
          //登录成功事件
          this.events.publish('USER_LOGIN_SUCCESS');
          this.navCtrl.setRoot('TaskListPage');
        }else {
          this.showAlert(data['Message']);
        }
      }).catch(error=>{
        this.util.dismissLoading();
        this.showAlert('登录失败，请稍后重试!');
      });
    }, 500);
  }

  showAlert(msg:string) {
    this.util.showAlert('提示',msg,'确定');
  }



}
