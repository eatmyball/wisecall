import { SoapApiProvider } from './../../providers/soap-api/soap-api';
import { UtilityProvider } from './../../providers/utility/utility';
import { TaskListItemModel, PictureForUpload } from './../task-list/task-list';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the TaskInfoPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-task-info',
  templateUrl: 'task-info.html',
})
export class TaskInfoPage {

  data:TaskListItemModel = new TaskListItemModel();
  //照片
  picArray = [];

  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    private util:UtilityProvider,
    private api:SoapApiProvider
    ) {
    this.data = navParams.get('data');
    this.initPicture();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TaskInfoPage');
  }

  initPicture(){
    if(this.data.imgs) {
      let array = this.data.imgs.split(',');
      for(let index in array) {
        let item = array[index];
        let picture = new PictureForUpload();
        picture.name = item;
        picture.thumbImgPath = this.api.THUMB_URL + item;
        picture.url = this.api.BASE_URL + item;
        this.picArray.push(picture);
      }
    }
  }

  showPicture(item:PictureForUpload){
    window.open(item.url);
  }

  playAudio() {
    
  }

  showAlert(msg: string) {
    this.util.showAlert('提示', msg, '确定');
  }

  //催单
  pushTransferBill(event) {
    event.stopPropagation();
    this.util.showAlertWithOkhandler(
      '提示', '确认是否催单', '取消', '确认', (data) => {
        this.util.showLoading('正在提交,请稍候...');
        setTimeout(() => {
          let reason = '';
          if(!this.data.urgeReason) {
            reason = '催单';
          }else {
            if(this.data.urgeReason == '催单') {
              reason = '再催';
            }else {
              reason = '再催';
            }
          }
          this.api.PushTransferTaskByID(this.data.billNo, reason).then(data => {
            this.util.dismissLoading();
              this.showAlert('催单成功');
              this.navCtrl.pop();
          }).catch(error => {
            this.util.dismissLoading();
            this.showAlert(JSON.stringify(error));
          });
        }, 500);
      }
    );
  }

  cancelTransferBill(event) {
    event.stopPropagation();
    this.util.showAlertWithOkhandler(
      '提示','确认是否取消任务','取消','确认',(data)=>{
        this.util.showLoading('正在提交,请稍候...');
        setTimeout(() => {
          this.api.CancelTransferTask(this.data.billNo).then(data=>{
            this.util.dismissLoading();
            this.showAlert('任务取消成功');
              this.navCtrl.pop();
          }).catch(error=>{
            this.util.dismissLoading();
            this.showAlert(JSON.stringify(error));
          });
        }, 500);
      }
    );
  }

  backClicked(event) {
    event.stopPropagation();
    this.navCtrl.pop();
  }

}
