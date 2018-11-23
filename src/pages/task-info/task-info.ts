import { SoapApiProvider } from './../../providers/soap-api/soap-api';
import { UtilityProvider } from './../../providers/utility/utility';
import { TaskListItemModel } from './../task-list/task-list';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { NULL_EXPR } from '@angular/compiler/src/output/output_ast';

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

  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    private util:UtilityProvider,
    private api:SoapApiProvider
    ) {
    this.data = navParams.get('data');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TaskInfoPage');
  }

  onImageClick(){
    if(this.data.imgs) {
      let images = [];
      let array = this.data.imgs.split(',');
      for(let index in array) {
        let item = array[index];
        images.push(this.api.BASE_URL + item);
      }
      this.navCtrl.push('GallaryPage', {imgs:images});
    }else {
      this.showAlert('没有病人检查单照片');
    }
  }

  playAudio() {
    
  }

  showAlert(msg: string) {
    this.util.showAlert('提示', msg, '确定');
  }

}
