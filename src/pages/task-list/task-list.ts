import { UtilityProvider, TOAST_POSITION } from './../../providers/utility/utility';
import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController, Refresher, InfiniteScroll } from 'ionic-angular';
import { PhotoViewer } from '@ionic-native/photo-viewer';


/**
 * Generated class for the TaskListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

export const MAX_IMG_SIZE: number = 2.0 * 1024 * 1024; //图片大小最大2.0M

export const TRANSPORT_PATIENT = 'PATIENT';
export const TRANSPORT_SPECIMEN = 'SPECIMEN';
export const TRANSPORT_DRUG = 'DRUG';
export const TRANSPORT_COMMODITY = 'COMMODITY';

export const SEG_DOING = 'DOING';
export const SEG_DONE = 'DONE';

@IonicPage()
@Component({
  selector: 'page-task-list',
  templateUrl: 'task-list.html',
})
export class TaskListPage {

  @ViewChild(Refresher) refresher: Refresher;
  @ViewChild(InfiniteScroll) scroll: InfiniteScroll;

  segSelect: string = SEG_DOING;

  taskType: string = 'LEFT';


  //病人运送表单内容
  //检查项目
  checkOptionArray = [{ name: 'MIR', isChecked: false }, { name: 'CT', isChecked: false }, { name: '超声医学科', isChecked: false },
  { name: '肠镜室', isChecked: false }, { name: '肺功能', isChecked: false }, { name: '心血管内科1', isChecked: false },
  { name: '胃镜室', isChecked: false }, { name: '碎石中心', isChecked: false }, { name: '介入诊疗中心', isChecked: false },
  { name: '疼痛科门诊', isChecked: false }, { name: '胃肠造影室', isChecked: false }, { name: '骨密度室', isChecked: false },
  { name: '支气管镜', isChecked: false }, { name: '放射科', isChecked: false }, { name: '肌电图', isChecked: false },
  { name: '脑电图', isChecked: false }, { name: '心电图室', isChecked: false }, { name: 'ECT', isChecked: false },
  { name: 'PET-CT', isChecked: false }, { name: '眼科门诊', isChecked: false }, { name: '眼科特检室', isChecked: false },
  { name: '近视激光中心', isChecked: false }, { name: '妇产科门诊', isChecked: false }];
  //更多检查项目
  checkOption: string = '';
  //运送工具
  transportOption: string = '轮椅';
  //检查时间
  checkDate: string = '';
  //选择的照片
  picArray = [];
  //备注
  comments: string = '';

  //送药运送表单内容
  //药房类型
  drugOption: string = '';

  //物品运送
  commodityArray = ['监护仪', '压力表', '轮椅', '微波炉', '其他'];
  //更多检查项目
  btn_commodity_text = '更多';


  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private menuCtrl: MenuController,
    private util: UtilityProvider,
    private photo:PhotoViewer,
  ) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TaskListPage');
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(true);
    // this.menuCtrl.open();
    this.checkDate = this.util.formatDateYYYYMMDDHHMM(new Date().getTime());
  }

  ionViewWillLeave() {
    this.menuCtrl.close();
    this.menuCtrl.enable(false);
  }


  doRefresh(event) {
    setTimeout(() => {
      this.refresher.complete();
    }, 1500);
  }

  doLoading(event) {

  }

  onTaskCreate() {

  }

  onSpecimenTransport() {

  }

  onCheckItemClicked(item) {
    item.isChecked = !item.isChecked;
  }

  takePhoto() {
    this.util.takePhoto().then(data=>{
      let img = new PictureForUpload();
      img.path = data;
      this.picArray.push(img);
    }).catch(error=>{
      console.log('Camera error:'+JSON.stringify(error));
      this.util.showToast('照相机初始化异常，请稍后重试!', TOAST_POSITION.MIDDLE);
    });
  }

  addPictures() {
    this.util.getPictureFromGallery().then(data => {
      console.log('get pictures:' + JSON.stringify(data));
      if (data.length > 0) {
        for (let index in data) {
          let item = data[index];
          //图片过大
          if (item['size'] > MAX_IMG_SIZE) {
            item['quality'] = 90;
            //压缩图片
            this.util.compressImage(item).then(data => {
              let img = new PictureForUpload();
              img.index = data['index'];
              img.name = data['name'];
              img.path = data['path'];
              img.uri = data['uri'];
              img.size = data['size'];
              this.picArray.push(img);
            });
          } else {
            let img = new PictureForUpload();
            img.index = item['index'];
            img.name = item['name'];
            img.path = item['path'];
            img.uri = item['uri'];
            img.size = item['size'];
            this.picArray.push(img);
          }
        }
      } else {
        this.util.showToast('请选择相册图片！', TOAST_POSITION.MIDDLE);
      }

    }).catch(error=>{
      this.util.showToast(error, TOAST_POSITION.MIDDLE);
    });
  }



  removeAll() {  
    this.picArray = [];
  }

  uploadPic() {

  }

  showPicture(item) {
    this.photo.show(item.path);
  }

}

export class PictureForUpload {
  index: number;
  path: string = '';
  uri: string = '';
  name: string = '';
  size: number;

  constructor() {

  }
}