import { UtilityProvider, TOAST_POSITION } from './../../providers/utility/utility';
import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController, Scroll } from 'ionic-angular';
import { SoapApiProvider } from '../../providers/soap-api/soap-api';
import * as Base64 from 'base64-js';

/**
 * Generated class for the TaskListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

const MAX_IMG_SIZE: number = 2.0 * 1024 * 1024; //图片大小最大2.0M
const AUTOREFRESH_TIME_INTERVAL = 30 * 1000; //自动刷新时间
const SCROLL_EVENT_INTERVAL = 3 * 1000;//滚动时间判断间隔
const CLOCK_TIME_INTERVAL = 1 * 1000; //每秒时钟

const TRANSPORT_PATIENT = 'PATIENT';
const TRANSPORT_SPECIMEN = 'SPECIMEN';
const TRANSPORT_DRUG = 'DRUG';
const TRANSPORT_COMMODITY = 'COMMODITY';

const SEG_DOING = 'DOING';
const SEG_DONE = 'DONE';

@IonicPage()
@Component({
  selector: 'page-task-list',
  templateUrl: 'task-list.html',
})
export class TaskListPage {

  @ViewChild('myListScroll') myListScroll: Scroll;

  segSelect: string = SEG_DOING;
  taskType: string = 'LEFT';

  //病人运送表单内容
  //床号
  bedNum: string = ''
  //病人姓名
  patientName: string = '';
  //检查项目
  checkOptionArray = [];
  //运送工具
  transportTools = [];
  transportOption: string = '轮椅';
  //检查时间
  checkDate: string = '';
  //选择的照片
  picArray = [];
  //备注
  comments: string = '';
  //整个表单form
  patientTransferBody = {};

  //送药运送表单内容
  //药房类型
  drugOption: string = '';
  drugTypies = [];

  //物品运送
  commodityArray = [{ name: '氧气', isChecked: false }, { name: 'PDA', isChecked: false },
  { name: '温仪', isChecked: false }, { name: '监护仪', isChecked: false },
  { name: '压力表', isChecked: false }, { name: '轮椅', isChecked: false },
  { name: '微波炉', isChecked: false }, { name: '其他', isChecked: false }];

  //录音相关
  MAX_RECORD_TIME = 60;
  text_record: string = '录音';
  text_stop: string = '停止';

  icon_record: string = 'ios-mic';
  icon_stop: string = 'ios-pause';

  btn_text_record = this.text_record;
  icon_text_record = this.icon_record;
  text_record_time = '';

  //任务列表
  doingTaskList = [];
  doneTaskList = [];


  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private menuCtrl: MenuController,
    private util: UtilityProvider,
    private api: SoapApiProvider
  ) {
    //系统有BUG要往前8个小时
    let now = new Date().getTime() + 8 * 60 * 60 * 1000;
    this.checkDate = new Date(now).toISOString();
    console.log('default Time:' + this.checkDate);
  }


  ionViewDidLoad() {
    console.log('ionViewDidLoad TaskListPage');
    
    this.initBaseDatas();
    //获取列表数据
    this.firstGetList();
  }

  ionViewDidLeave() {
    
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(true);
    // this.menuCtrl.open();
    this.initTimer();

  }

  ionViewWillLeave() {
    this.menuCtrl.close();
    this.menuCtrl.enable(false);
    clearInterval(this.autoRefreshhandlerId);
    clearInterval(this.clockHandlerId);
  }

  autoRefreshhandlerId;
  clockHandlerId;
  initTimer() {
    this.autoRefreshhandlerId = setInterval(() => {
      //自动刷新列表
      if (!this.isScroll) {
        this.getTrackListData();
      }
    }, AUTOREFRESH_TIME_INTERVAL);

    //重置滚动事件状态
    this.clockHandlerId = setInterval(() => {
      if (this.isScroll) {
        let now = new Date().getTime();
        console.log();
        if ((now - this.lastScrollTime) > SCROLL_EVENT_INTERVAL) {
          this.isScroll = false;
        }
      }
    }, CLOCK_TIME_INTERVAL);
  }

  //是否滚动状态
  isScroll: boolean = false;
  //最后滚动触发时间
  lastScrollTime;
  intiScrollEvent() {
    if (this.myListScroll) {
      this.myListScroll.addScrollEventListener((event) => {
        this.isScroll = true;
        this.lastScrollTime = new Date().getTime();
      })
    }
  }

  /**
   * 选项类数据初始化
   */
  initBaseDatas() {
    //检查项目
    this.api.GetCheckItemByHospitalDeptCode().then(data => {
      if (data['Flag'] === 'S') {
        let datas = data['dsData']['Table'];
        for (let index in datas) {
          let item = datas[index];
          item['isChecked'] = false;
          this.checkOptionArray.push(item);
        }
      }
    }).catch(error => {
    });

    //运送工具
    this.api.GetTransferTools().then(data => {
      if (data['Flag'] === 'S') {
        this.transportTools = data['dsData']['Table'];
      }
    }).catch(error => {
    });

    //药房类型
    this.api.GetDrugTypeByHospitalDeptCode().then(data => {
      if (data['Flag'] === 'S') {
        this.drugTypies = data['dsData']['Table'];
      }
    }).catch(error => {
    });
  }

  //第一次打开，有刷新效果
  firstGetList() {
    this.util.showLoading('努力加载中...');
    setTimeout(() => {
      this.util.dismissLoading();
      this.getTrackListData();
    }, 2000);
  }

  getTrackListData() {
    let doingArray = [];
    let doneArray = [];
    this.api.getTrackList().then(data => {
      if (data) {
        let array = data['dsData']['Table']
        for (let index in array) {
          let item = new TaskListItemModel();
          item.BillNo = array[index]['BillNo'];
          item.BillType = array[index]['BillType'];
          item.TargetType = array[index]['TargetType'];
          item.FromLocation = array[index]['FromLocation'];
          item.FromSickbed = array[index]['FromSickbed'];
          item.ToLocation = array[index]['ToLocation'];
          item.PatientNo = array[index]['PatientNo'];
          item.Patientname = array[index]['Patientname'];
          item.Patientsex = array[index]['Patientsex'];
          item.PatientOld = array[index]['PatientOld'];
          item.PatientBirthday = array[index]['PatientBirthday'] ? this.util.formatAPIDate(new Date(array[index]['PatientBirthday']).getTime()):'';
          item.Operator = array[index]['Operator'];
          item.ExecuteBy = array[index]['ExecuteBy'];
          item.ExecuteStart = array[index]['ExecuteStart'] ? this.util.formatAPIDate(new Date(array[index]['ExecuteStart']).getTime()): '';
          item.ExecuteEnd = array[index]['ExecuteEnd'];
          item.RelatedBillNo = array[index]['RelatedBillNo'];
          item.DelayReason = array[index]['DelayReason'];
          item.DelayAt = array[index]['DelayAt'];
          item.CancelReason = array[index]['CancelReason'];
          item.CancelBy = array[index]['CancelBy'];
          item.DelegateReason = array[index]['DelegateReason'];
          item.DelegateBy = array[index]['DelegateBy'];
          item.DelegateAt = array[index]['DelegateAt'];
          item.String6 = array[index]['String6'];
          item.CREATEDATE = array[index]['CREATEDATE']? this.util.formatAPIDate(new Date(array[index]['CREATEDATE']).getTime()):'';
          item.MODIFYDATE = array[index]['MODIFYDATE']? this.util.formatAPIDate(new Date(array[index]['MODIFYDATE']).getTime()):'';
          item.AssignAt = array[index]['AssignAt'] ? this.util.formatAPIDate(new Date(array[index]['AssignAt']).getTime()):'';
          item.imgs = array[index]['String9'];
          item.String1 = array[index]['String1'];
          item.String3 = array[index]['String3'];
          item.EmergencyLevel = array[index]['EmergencyLevel'];
          item.BillNo = array[index]['BillNo'];
          
          item.Note = array[index]['Note'];
          item.State = array[index]['State'];
          if (item.State === '完工') {
            doneArray.push(item);
          } else {
            doingArray.push(item);
          }
        }
        this.doingTaskList = doingArray.slice();
        this.doneTaskList = doneArray.slice();
      }

    }).catch(error => {
      console.log('trackList error:' + JSON.stringify(error, Object.getOwnPropertyNames(error)));
    });

  }

  //病人运送任务
  onPatientTransferTaskCreate() {
    let isChecked = false;
    for(let index in this.checkOptionArray) {
      let item = this.checkOptionArray[index];
      if(item['isChecked']) {
        isChecked = true;
      }
    }
    if(isChecked) {
      this.util.showLoading('创建任务中,请稍候...');
      setTimeout(() => {
        let data = this.getTransferDataForm(TRANSPORT_PATIENT);
        this.api.createPatientTransferTask(data).then(result => {
          this.util.dismissLoading();
          if (result['Flag'] === 'S') {
            this.showAlert('创建成功');
            this.resetFormData();
          } else {
            this.showAlert('创建失败,' + result['Message']);
          }
        }).catch(error => {
          this.util.dismissLoading();
          this.showAlert('创建失败,请稍后重试！');
        });
      }, 500);
    }else{
      this.showAlert('请至少选择一项检查项!');
    }
    
  }

  //标本运送
  onSpecimenTransport() {

  }

  //运送任务表单结构
  getTransferDataForm(transferType: string): Object {

    let data = { "HospitalCode": "03023" };
    data['FromLocation'] = this.api.userInfo['DeptName'];
    data['PatientOld'] = 99;
    data['AssignAlertBefore'] = 5;
    data['ExecuteAlertBefore'] = 10;
    data['StandardLength'] = 15;
    data['EmergencyLevelName'] = '二级';
    data['EmergencyLevelNo'] = 'EL002';
    switch (transferType) {
      //病人运送
      case TRANSPORT_PATIENT:
        data['TargetType'] = "病人";
        data['TransferTools'] = this.transportOption;
        data['FromSickbed'] = this.bedNum;
        data['PatientName'] = this.patientName;
        data['BillType'] = '即时';
        data['CreatedByCode'] = this.api.userInfo['Account'];
        data['CreateDatetime'] = this.checkDate;
        data['CheckTime'] = this.checkDate;
        let picStr = '';
        for(let index in this.picArray) {
          let item = this.picArray[index];
          picStr += item['name'] + ',';
        }
        if(picStr) {
          data['String9']= picStr.substring(0, picStr.length -1);
        }
        let toLocation = '';
        let note = this.comments + ',';
        console.log('checkOptions' + JSON.stringify(this.checkOptionArray));
        for (let index in this.checkOptionArray) {
          let item = this.checkOptionArray[index];
          if (item['isChecked']) {
            toLocation += item['PROPNAME'] + ',';
            note += item['PROPSTRING6'] + ',' + this.checkDate + ','
          }

        }
        toLocation = toLocation.substring(0, toLocation.length - 1);
        note = note.substring(0, note.length - 1);
        data['ToLocation'] = toLocation;
        data['Note'] = note;
        break;
      case TRANSPORT_SPECIMEN:
        data['TargetType'] = "标本";
        break;
      case TRANSPORT_DRUG:
        data['TargetType'] = "药品";
        break;
      case TRANSPORT_COMMODITY:
        data['TargetType'] = "物品";
        break;
    }

    return data;
  }

  onCheckItemClicked(item) {
    item.isChecked = !item.isChecked;
    console.log('checkOptions' + JSON.stringify(this.checkOptionArray));
  }

  takePhoto() {
    this.util.takePhoto().then(data => {
      if (data) {
        this.uploadPicture(data);
      } else {
        this.util.showToast('获取照片失败，请稍候重试!', TOAST_POSITION.MIDDLE);
      }
    }).catch(error => {
      console.log('Camera error:' + JSON.stringify(error, Object.getOwnPropertyNames(error)));
      this.util.showToast('获取照片失败，请稍候重试!', TOAST_POSITION.MIDDLE);
    });
  }

  uploadPicture(data: string) {
    this.util.showLoading('上传照片中,请稍候...');
    setTimeout(() => {
      let name = new Date().getTime() + '.jpg'
      this.api.uploadFile(data, name).then(data => {
        this.util.dismissLoading();
        if (data['Flag'] === 'S') {
          let pic = new PictureForUpload();
          pic.name = name;
          pic.index = this.picArray.length + 1;
          this.picArray.push(pic);
        } else {
          this.showAlert('上传失败，请稍后重试！');
        }
      }).catch(error => {
        this.util.dismissLoading();
        console.log('Upload error:' + JSON.stringify(error, Object.getOwnPropertyNames(error)));
        this.showAlert('' + error);
      });
    }, 200);
  }

  resetFormData() {
    //病人运送表单内容
    //床号
    this.bedNum = ''
    //病人姓名
    this.patientName = '';
    //检查项目
    this.checkOptionArray.forEach((item, index) => {
      item['isChecked'] = false;
    });
    //选择的照片
    this.picArray = [];
    //备注
    this.comments = '';
    //物品运送
    this.commodityArray.forEach((item, index) => {
      item['isChecked'] = false;
    });
  }

  removeAll() {
    this.picArray = [];
  }

  showPicture(item) {
    //base64显示图片
  }

  listItemClicked(item:TaskListItemModel) {
    this.navCtrl.push('TaskInfoPage',{data:item});
  }

  pushTransferBill(event,item:TaskListItemModel) {
    event.stopPropagation();

    this.util.showLoading('正在提交,请稍候...');
    setTimeout(() => {
      this.api.PushTransferTaskByID(item.BillNo).then(data=>{
        this.util.dismissLoading();
        if(data['Flag'] === 'S') {
          this.showAlert('催单成功');
        }else {
          this.showAlert('催单失败,'+data['Message']);
        }
      }).catch(error=>{
        this.util.dismissLoading();
        this.showAlert(JSON.stringify(error));
      });
    }, 500);
  }


  is_Record_start = false;
  recordActionClicked() {
    this.is_Record_start = !this.is_Record_start;

    if (this.is_Record_start) {
      this.btn_text_record = this.text_stop;
      this.icon_text_record = this.icon_stop;
      this.text_record_time = '00:00';
      this.secondNum = 0;
      this.startRecord();
    } else {
      clearInterval(this.recordHandlerId);
      this.btn_text_record = this.text_record;
      this.icon_text_record = this.icon_record;
    }
  }

  recordHandlerId = 0;
  secondNum = 0;
  startRecord() {
    this.recordHandlerId = setInterval(() => {
      if (this.secondNum < this.MAX_RECORD_TIME) {
        this.secondNum++;
        if (this.secondNum < 10) {
          this.text_record_time = '00:0' + this.secondNum;
        } else {
          this.text_record_time = '00:' + this.secondNum;
        }
      } else {
        this.recordActionClicked();
      }
    }, 1000);
  }

  showAlert(msg: string) {
    this.util.showAlert('提示', msg, '确定');
  }

}

export class PictureForUpload {
  name: string = '';
  index: number;

  constructor() {

  }
}

export class TaskListItemModel {
  BillNo: string = '';
  BillType: string = '';
  TargetType: string = '';
  FromLocation: string = '';
  FromSickbed: string = '';
  ToLocation: string = '';
  PatientNo: string = '';
  Patientname: string = '';
  Patientsex: string = '';
  PatientOld: string = '';
  PatientBirthday: string = '';
  State: string = '';
  Operator: string = '';
  ExecuteBy: string = '';
  ExecuteStart: string = '';
  ExecuteEnd: string = '';
  RelatedBillNo: string = '';
  DelayReason: string = '';
  DelayAt: string = '';
  CancelReason: string = '';
  CancelBy: string = '';
  DelegateReason: string = '';
  DelegateBy: string = '';
  DelegateAt: string = '';
  imgs:string = '';
  String6: string = '';
  CREATEDATE: string = '';
  MODIFYDATE: string = '';
  String1:string = '';
  String3:string = '';
  EmergencyLevel:string = '';
  AssignAt:string = '';
  Note:string = '';
  constructor() {

  }
}