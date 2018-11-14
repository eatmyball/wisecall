import { UtilityProvider } from './../../providers/utility/utility';
import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController, Refresher, InfiniteScroll } from 'ionic-angular';

/**
 * Generated class for the TaskListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

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

  taskType: string = TRANSPORT_PATIENT;


  //病人运送表单内容
  //检查项目
  checkOptionArray = ['肠镜室', '肺功能',
    '心血管内科1', '胃镜室', '碎石中心', '介入诊疗中心', '疼痛科门诊', '胃肠造影室',
    '骨密度室', '支气管镜', '放射科', '肌电图', '脑电图', '心电图室', 'ECT', 'PET-CT',
    '眼科门诊', '眼科特检室', '近视激光中心', '妇产科门诊'];
  //更多检查项目
  isShowMoreOption = false;
  btn_check_text = '更多';
  checkOption: string = '';
  //运送工具
  transportOption: string = '轮椅';
  //检查时间
  checkDate: string = '';
  //备注
  comments: string = '';

  //送药运送表单内容
  //药房类型
  drugOption: string = '';

  //物品运送
  commodityArray = ['监护仪','压力表','轮椅','微波炉','其他' ];
  //更多检查项目
  isShowMoreCommodity = false;
  btn_commodity_text = '更多';

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private menuCtrl: MenuController,
    private util: UtilityProvider
  ) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TaskListPage');
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(true);
    this.menuCtrl.open();
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

  onMoreOptionClicked() {
    this.isShowMoreOption = !this.isShowMoreOption;
    if(this.isShowMoreOption) {
      this.btn_check_text = '收起';
    }else {
      this.btn_check_text = '更多';
    }
  }

  onMoreCommodityClicked() {
    this.isShowMoreCommodity = !this.isShowMoreCommodity;
    if(this.isShowMoreCommodity) {
      this.btn_commodity_text = '收起';
    }else {
      this.btn_commodity_text = '更多';
    }
  }

}
