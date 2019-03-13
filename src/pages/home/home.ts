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
  checkOptionArray = [];

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
        //登录成功
        if(data['Flag'] === 'S') {
          //保存用户名密码
          this.local.save('account', this.username);
          this.local.save('password', this.password);
          if(this.username.length >=5) {
            this.api.setHosipitalCode(this.username.substring(0, 5));
          }
          this.api.setUserInfo(data['dsData']['Table1'][0]);
          //获取检查项数据列表
          this.getCheckItemByHospitalDeptCode();
        }else {
          this.showAlert(data['Message']);
        }
      }).catch(error=>{
        this.util.dismissLoading();
        this.showAlert('登录失败，请稍后重试!');
      });
    }, 500);
  }

    //检查项目
    getCheckItemByHospitalDeptCode() {
      this.api.GetCheckItemByHospitalDeptCodeForIpad().then(data => {
        this.util.dismissLoading();
        if (data['Flag'] === 'S') {
          let datas = data['dsData']['Table'];
          for (let index in datas) {
            let item = datas[index];
            item['isChecked'] = false;
            this.checkOptionArray.push(item);
          }
          //拿到检查项，则登录成功
          if(this.checkOptionArray.length > 0) {
            this.events.publish('USER_LOGIN_SUCCESS');
            this.navCtrl.setRoot('TaskListPage',{data:this.checkOptionArray});
          }else {
            this.showAlert('登录失败，请稍后重试!');
          }
        }else{
          this.showAlert('登录失败，请稍后重试!');
        }
      }).catch(error => {
        this.util.dismissLoading();
        this.showAlert('登录失败，请稍后重试!');
      });
    }

  showAlert(msg:string) {
    this.util.showAlert('提示',msg,'确定');
  }



}
