import { UtilityProvider, TOAST_POSITION } from './../../providers/utility/utility';
import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController, Scroll, Platform, DateTime } from 'ionic-angular';
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
  @ViewChild('timepicker') timepicker: DateTime;
  @ViewChild('birthday') timepicker2: DateTime;

  segSelect: string = SEG_DOING;
  taskType: string = 'LEFT';

  //病人运送表单内容
  //床号
  bedNum: string = ''
  //病人姓名
  patientName: string = '';
  //病人腕带号
  patientWristband: string = '';
  //病人生日
  patientBirthday: string =  '';
  birthForshow: string = '';
  //检查项目
  checkOptionArray = [];
  //运送工具
  transportTools = [{ name: '轮椅', isChecked: true }, { name: '平车', isChecked: false },
  { name: '拉床', isChecked: false }, { name: '步行', isChecked: false }];
  transportOption: string = '轮椅';
  //预约时间
  checkDate: string = '';
  dateTimeForShow: string = '';
  //选择的照片
  picArray = [];
  //备注
  comments: string = '';

  //标本运送
  isEmergency: boolean = true;
  //标本类型
  specimenTypes = [{sampleName:'血气', isChecked:true}, {sampleName:'血', isChecked:false}, {sampleName:'液末尿', isChecked:false}, {sampleName:'脑积液', isChecked:false}
                    ,{sampleName:'胸腹水', isChecked:false}, {sampleName:'尿便', isChecked:false}, {sampleName:'血尿痰培养', isChecked:false}, {sampleName:'血沉', isChecked:false}
                    ,{sampleName:'G实验', isChecked:false}, {sampleName:'其他', isChecked:false}
                  ];

  //送药运送表单内容
  // drugTypies = [];

  //物品运送
  commodityArray = [{ name: '甲苯', isChecked: false }, { name: '盐酸', isChecked: false },
  { name: '4L氧气', isChecked: false }, { name: '10L氧气', isChecked: false }, { name: '40L氧气', isChecked: false },
  { name: 'PDA', isChecked: false }, { name: '动态包', isChecked: false }, { name: '绿盖短管', isChecked: false },
  { name: '咽试子管', isChecked: false }, { name: '紫盖长管', isChecked: false }, { name: '监护仪', isChecked: false },
  { name: '微波炉', isChecked: false }, { name: '红光治疗仪', isChecked: false }, { name: '微泵', isChecked: false },
  { name: '气泵', isChecked: false }, { name: '流量表', isChecked: false }, { name: '耳温仪', isChecked: false }
  , { name: '血培养', isChecked: false }, { name: '血箱', isChecked: false }, { name: '眼科培养', isChecked: false }
  , { name: '气垫床', isChecked: false }, { name: '平车', isChecked: false }, { name: '轮椅', isChecked: false }
  , { name: '甲醛', isChecked: false }, { name: '盐水送介入', isChecked: false }, { name: '造影剂（提供姓名生日）', isChecked: false }];
  isOther: boolean = false;
  otherCommodity: string = '';
  commodityComments: string = '';
  //物品运输数量
  commodityNum: string = '';
  //默认送物品
  isSendCommodity: boolean = true;
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

  //运送人员位置信息
  lastDept:string = '暂无';
  lastDeptTime:string = '暂无';
  currentDept:string = '暂无'
  currentDeptTime:string = '暂无'
  nextDept:string = '暂无'



  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private menuCtrl: MenuController,
    private util: UtilityProvider,
    private api: SoapApiProvider,
    private platform: Platform
  ) {
    // this.initDefaultTime();
    this.checkOptionArray = this.navParams.get('data');
  }


  ionViewDidLoad() {
    console.log('ionViewDidLoad TaskListPage');

    this.initBaseDatas();
    //获取列表数据
    this.getTrackListDataShowLoading();
    //获取运送站点信息
    this.getTransferPath();
  }

  ionViewDidLeave() {

  }

  ionViewWillEnter() {
    this.menuCtrl.enable(true);
    // this.menuCtrl.open();
    this.initTimer();
    this.getTrackListData();

  }

  ionViewWillLeave() {
    this.menuCtrl.close();
    this.menuCtrl.enable(false);
    clearInterval(this.autoRefreshhandlerId);
    clearInterval(this.clockHandlerId);
  }

  initDefaultTime() {
    //北京时区
    this.checkDate = this.util.dateFormat(new Date(), 'yyyy-MM-ddTHH:mm:ss+08:00');
    console.log('init default Time:' + this.checkDate);
  }

  autoRefreshhandlerId;
  clockHandlerId;
  initTimer() {
    this.autoRefreshhandlerId = setInterval(() => {
      //自动刷新列表
      if (!this.isScroll) {
        this.getTrackListData();
        //获取运送站点信息
        this.getTransferPath();
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
    // this.getTransferTools();
    // this.getCheckItemByHospitalDeptCode();
    // this.getDrugTypeByHospitalDept();
    if (this.checkOptionArray && this.checkOptionArray.length > 0) {
      console.log('登录成功!');
    } else {
      this.util.dismissLoading();
      this.util.showAlertOneBtn('提示', '数据初始化异常,请重新登录!', '确定', (data) => {
        this.platform.exitApp();
      });
    }
  }

  //运送工具
  // getTransferTools() {

  //   this.api.GetTransferTools().then(data => {
  //     if (data['Flag'] === 'S') {
  //       this.transportTools = data['dsData']['Table'];
  //     }
  //   }).catch(error => {
  //   });
  // }

  //药房类型
  // getDrugTypeByHospitalDept() {
  //   this.api.GetDrugTypeByHospitalDeptCode().then(data => {
  //     if (data['Flag'] === 'S') {
  //       this.drugTypies = data['dsData']['Table'];
  //     }
  //   }).catch(error => {
  //   });
  // }


  //第一次打开，有刷新效果
  getTrackListDataShowLoading() {
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
          item.patientname = array[index]['patientname'];
          item.Patientsex = array[index]['Patientsex'];
          item.PatientOld = array[index]['PatientOld'];
          item.PatientBirthday = array[index]['PatientBirthday'] ? this.util.dateFormat(new Date(array[index]['PatientBirthday']), 'yyyy-MM-dd HH:mm') : '';
          item.Operator = array[index]['Operator'];
          item.ExecuteBy = array[index]['ExecuteBy'];
          item.ExecuteStart = array[index]['ExecuteStart'] ? this.util.dateFormat(new Date(array[index]['ExecuteStart']), 'yyyy-MM-dd HH:mm') : '';
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
          item.CREATEDATE = array[index]['CREATEDATE'] ? this.util.dateFormat(new Date(array[index]['CREATEDATE']), 'yyyy-MM-dd HH:mm') : '';
          item.MODIFYDATE = array[index]['MODIFYDATE'] ? this.util.dateFormat(new Date(array[index]['MODIFYDATE']), 'yyyy-MM-dd HH:mm') : '';
          item.AssignAt = array[index]['AssignAt'] ? this.util.dateFormat(new Date(array[index]['AssignAt']), 'yyyy-MM-dd HH:mm') : '';
          item.imgs = array[index]['String9'];
          item.String1 = array[index]['String1'];
          item.String3 = array[index]['String3'];
          item.EmergencyLevel = array[index]['EmergencyLevel'];
          item.BillNo = array[index]['BillNo'];
          item.String10 = array[index]['String10'];
          item.String12 = array[index]['String12'];
          item.Note = array[index]['Note'];
          item.DelayBy = array[index]['DelayBy'];
          if (item.DelayBy) {
            if (item.DelayBy === '催单') {
              item.isFirstPush = true;
            } else {
              item.isFirstPush = false;
            }
            item.delayByStr = '已催单';
          } else {
            item.delayByStr = '';
          }

          item.State = array[index]['State'];
          if (item.State === '完工' || item.State === '取消') {
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

    this.util.showAlertWithOkhandler('提示', '是否创建病人运送任务', '否', '是', (data) => {
      //床号不能为空
      if(!this.bedNum) {
        this.showAlert('请填写病人床号!');
        return;
      }
      let isChecked = false;
      for (let index in this.checkOptionArray) {
        let item = this.checkOptionArray[index];
        if (item['isChecked']) {
          isChecked = true;
        }
      }
      if (isChecked) {
        this.util.showLoading('创建任务中,请稍候...');
        setTimeout(() => {
          let data = this.getTransferDataForm(TRANSPORT_PATIENT);
          this.api.createTransferTask(data).then(result => {
            this.util.dismissLoading();
            if (result['Flag'] === 'S') {
              this.showAlert('创建成功');
              this.resetFormData();
              this.getTrackListData(); //刷新列表
            } else {
              this.showAlert(result['Message']);
            }
          }).catch(error => {
            this.util.dismissLoading();
            this.showAlert('创建失败,请稍后重试！');
          });
        }, 500);
      } else {
        this.showAlert('请至少选择一项检查项!');
      }
    });

  }

  //标本运送
  onSpecimenTransport(flag: boolean) {
    this.isEmergency = flag;
    let msg = this.isEmergency ? '急诊' : '平诊';
    //标本运送
    this.util.showAlertWithOkhandler('提示', '是否创建' + msg + '标本运送任务', '否', '是', (data) => {
      this.util.showLoading('创建任务中,请稍候...');
      let params = this.getTransferDataForm(TRANSPORT_SPECIMEN);
      this.api.createTransferTask(params).then(result => {
        this.util.dismissLoading();
        if (result['Flag'] === 'S') {
          this.showAlert('创建成功');
          this.getTrackListData(); //刷新列表
        } else {
          this.showAlert(result['Message']);
        }
      }).catch(error => {
        this.util.dismissLoading();
        this.showAlert('创建失败,请稍后重试！');
      })
    });

  }

  //药品运送
  onDrugTransferClicked() {
    this.util.showAlertWithOkhandler('提示', '是否创建药品运送任务', '否', '是', (data) => {
      let params = this.getTransferDataForm(TRANSPORT_DRUG);
      this.util.showLoading('创建任务中,请稍候...');
      this.api.createTransferTask(params).then(result => {
        this.util.dismissLoading();
        if (result['Flag'] === 'S') {
          this.showAlert('创建成功');
          this.getTrackListData(); //刷新列表
        } else {
          this.showAlert(result['Message']);
        }
      }).catch(error => {
        this.util.dismissLoading();
        this.showAlert('创建失败,请稍后重试！');
      })
    });
  }

  //物品运送
  onCommodityTransferClicked(isSend) {
    this.isSendCommodity = isSend;
    let isChecked = false;
    for (let index in this.commodityArray) {
      let item = this.commodityArray[index];
      if (item['isChecked']) {
        isChecked = true;
      }
    }
    if (isChecked || this.isOther) {
      if (this.isOther) {
        if (this.otherCommodity) {
          this.util.showLoading('创建任务中,请稍候...');
          setTimeout(() => {
            let data = this.getTransferDataForm(TRANSPORT_COMMODITY);
            this.api.createTransferTask(data).then(result => {
              this.util.dismissLoading();
              if (result['Flag'] === 'S') {
                this.showAlert('创建成功');
                this.resetFormData();
                this.getTrackListData(); //刷新列表
              } else {
                this.showAlert(result['Message']);
              }
            }).catch(error => {
              this.util.dismissLoading();
              this.showAlert('创建失败,请稍后重试！');
            });
          }, 500);
        } else {
          this.showAlert('请输入其他运送物品的信息!');
        }
      } else {
        this.util.showLoading('创建任务中,请稍候...');
        setTimeout(() => {
          let data = this.getTransferDataForm(TRANSPORT_COMMODITY);
          this.api.createTransferTask(data).then(result => {
            this.util.dismissLoading();
            if (result['Flag'] === 'S') {
              this.showAlert('创建成功');
              this.resetFormData();
              this.getTrackListData(); //刷新列表
            } else {
              this.showAlert(result['Message']);
            }
          }).catch(error => {
            this.util.dismissLoading();
            this.showAlert('创建失败,请稍后重试！');
          });
        }, 500);
      }

    } else {
      this.showAlert('请至少选择一项检查项!');
    }

  }

  //标本运送催单
  onSpecimenPushTask() {
    this.util.showAlertWithOkhandler(
      '提示', '确认是否催单', '取消', '确认', (data) => {
        this.util.showLoading('正在提交,请稍候...');
        setTimeout(() => {
          this.api.PushTransferTaskByID(this.api.userInfo['DeptCode']).then(data => {
            this.util.dismissLoading();
            if (data['Flag'] === 'S') {
              this.showAlert('催单成功');
              this.getTrackListData();
            } else {
              this.showAlert(data['Message']);
            }
          }).catch(error => {
            this.util.dismissLoading();
            this.showAlert(JSON.stringify(error));
          });
        }, 500);
      }
    );
  }

  //运送任务表单结构
  getTransferDataForm(transferType: string): Object {

    let data = { "HospitalCode": this.api.HOSPITALCODE };
    data['PatientOld'] = 0;
    data['AssignAlertBefore'] = 5;
    data['ExecuteAlertBefore'] = 10;
    data['StandardLength'] = 15;
    data['EmergencyLevelName'] = '二级';
    data['EmergencyLevelNo'] = 'EL002';
    data['patientname'] = '';
    data['CreatedByCode'] = this.api.userInfo['Account'];
    data['BillType'] = '即时';
    switch (transferType) {
      //病人运送
      case TRANSPORT_PATIENT:
        data['FromLocation'] = this.api.userInfo['DeptName'];
        data['TargetType'] = "病人";
        data['TransferTools'] = this.transportOption;
        data['FromSickbed'] = this.bedNum;
        data['patientname'] = this.patientName;
        data['PatientNo'] = this.patientWristband;
        let checkDateStr = ''
        if (this.checkDate) {
          checkDateStr = this.util.formatAPIDate(new Date(this.checkDate).getTime());
        }
        //如果用户没有选择时间，给一个默认初始时间
        data['CheckTime'] = checkDateStr ? checkDateStr : this.util.formatAPIDate(0);
        let picStr = '';
        for (let index in this.picArray) {
          let item = this.picArray[index];
          picStr += item['name'] + ',';
        }
        if (picStr) {
          data['String9'] = picStr.substring(0, picStr.length - 1);
        }
        let toLocation = '';
        let checkOptions = '';
        for (let index in this.checkOptionArray) {
          let item = this.checkOptionArray[index];
          if (item['isChecked']) {
            toLocation += item['PROPNAME'] + ',';
            checkOptions += item['PROPSTRING7'] + ','
          }

        }
        toLocation = toLocation.substring(0, toLocation.length - 1);
        checkOptions = checkOptions.substring(0, checkOptions.length - 1);
        data['ToLocation'] = toLocation;
        // 用户生日放在备注最后
        data['Note'] = this.comments +' 病人生日:'+this.birthForshow;
        data['String10'] = checkOptions;
        break;
      case TRANSPORT_SPECIMEN:
        let specimenTypestr = '';
        for (let index in this.specimenTypes) {
          let item = this.specimenTypes[index];
          if (item['isChecked']) {
            specimenTypestr += item['sampleName'] + ',';
          }
        }
        data['Note'] = specimenTypestr;
        data['String12'] = this.isEmergency ? '急诊标本运送' : '平诊标本运送';
        data['FromLocation'] = this.api.userInfo['DeptName'];
        data['TargetType'] = "标本";
        break;
      case TRANSPORT_DRUG:
        data['FromLocation'] = this.api.userInfo['DeptName'];
        data['TargetType'] = "药品";
        break;
      case TRANSPORT_COMMODITY:
        //给一个默认初始时间
        data['CheckTime'] = this.util.formatAPIDate(0);
        let commodityStr = '';
        for (let index in this.commodityArray) {
          let item = this.commodityArray[index];
          if (item['isChecked']) {
            commodityStr += item['name'] + ',';
          }
        }
        commodityStr = commodityStr.substring(0, commodityStr.length - 1);
        commodityStr = this.isOther && this.otherCommodity ? commodityStr + ',' + this.otherCommodity : commodityStr;
        data['String10'] = commodityStr;
        if (this.isSendCommodity) {
          data['ToLocation'] = this.api.userInfo['DeptName'];
          data['FromLocation'] = '';
        } else {
          data['FromLocation'] = this.api.userInfo['DeptName'];
          data['ToLocation'] = '';
        }
        data['Note'] = '数量:'+this.commodityNum + ' 备注:'+this.commodityComments;
        data['TargetType'] = "物品";
        break;
    }

    return data;
  }

  onListSegClicked(isDoing) {
    if (isDoing) {
      this.segSelect = SEG_DOING;
    } else {
      this.segSelect = SEG_DONE;
    }
  }

  onCheckItemClicked(item) {
    item.isChecked = !item.isChecked;
  }

  onCommodityOthersChecked() {
    this.isOther = !this.isOther;

  }

  onTransferToolsClicked(index) {
    for (let i in this.transportTools) {
      let item = this.transportTools[i];
      if (Number(i) === index) {
        item.isChecked = true;
        this.transportOption = item.name;
      } else {
        item.isChecked = false;
      }
    }

  }

  onSpecimenTypesClicked(item) {
    for (let i in this.specimenTypes) {
      let specimen = this.specimenTypes[i];
      if (specimen.sampleName == item.sampleName) {
        specimen.isChecked = !specimen.isChecked;
      }
    }

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
          pic.thumbImgPath = this.api.THUMB_URL + pic.name;
          pic.url = this.api.BASE_URL + pic.name;
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
    //时间
    this.checkDate = '';
    //床号
    this.bedNum = ''
    //病人姓名
    this.patientName = '';
    //病人腕带
    this.patientWristband = '';
    //生日
    this.patientBirthday = '';
    this.birthForshow = '';
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
    //物品运送备注
    this.commodityComments = '';
    this.commodityNum = '';
  }

  removeAll() {
    this.picArray = [];
  }

  showPicture(item: PictureForUpload) {
    //base64显示图片
    window.open(item.url);
  }

  listItemClicked(item: TaskListItemModel) {
    this.navCtrl.push('TaskInfoPage', { data: item });
  }

  onDateTimeClicked() {
    this.initDefaultTime();
    setTimeout(() => {
      if(this.timepicker) {
        this.timepicker.open();
      }
    }, 100);
  }

  onBirthDateClicked() {
    setTimeout(() => {
      if(this.timepicker2) {
        this.timepicker2.open();
      }
    }, 100);
  }

  onDateTimeChanged() {
    this.dateTimeForShow = this.util.formatDateYYYYMMDDHHMM(new Date(this.checkDate).getTime());
  }

  onBirthdayChanged() {
    this.birthForshow = this.util.dateFormat(new Date(this.patientBirthday), 'yyyy-MM-dd');
  }

  //催单
  pushTransferBill(event, item: TaskListItemModel) {
    event.stopPropagation();
    this.util.showAlertWithOkhandler(
      '提示', '确认是否催单', '取消', '确认', (data) => {
        this.util.showLoading('正在提交,请稍候...');
        setTimeout(() => {
          this.api.PushTransferTaskByID(item.BillNo).then(data => {
            this.util.dismissLoading();
            if (data['Flag'] === 'S') {
              this.showAlert('催单成功');
              this.getTrackListData();
            } else {
              this.showAlert(data['Message']);
            }
          }).catch(error => {
            this.util.dismissLoading();
            this.showAlert(JSON.stringify(error));
          });
        }, 500);
      }
    );
  }

  cancelTransferBill(event, item: TaskListItemModel) {
    event.stopPropagation();
    this.util.showAlertWithOkhandler(
      '提示', '确认是否取消任务', '取消', '确认', (data) => {
        this.util.showLoading('正在提交,请稍候...');
        setTimeout(() => {
          this.api.CancelTransferTask(item.BillNo).then(data => {
            this.util.dismissLoading();
            if (data['Flag'] === 'S') {
              this.showAlert('任务取消成功');
              this.getTrackListData();
            } else {
              this.showAlert(data['Message']);
            }
          }).catch(error => {
            this.util.dismissLoading();
            this.showAlert(JSON.stringify(error));
          });
        }, 500);
      }
    );
  }

  getTransferPath() {
    this.api.getTransferPath().then(data=>{
      if(data) {
        if(data['Flag'] == 'S') {
          let result = data['dsData']['Table'][0];
          if(result) {
            this.lastDept = result['DeptPrv'];
            this.currentDept =result['DeptCurrent'];
            this.nextDept = result['DeptNext'];
            return;
          }
        }
      }
    }).catch(error=>{

    });
    this.lastDept = '暂无';
    this.lastDeptTime = '暂无';
    this.currentDept = '暂无'
    this.currentDeptTime = '暂无'
    this.nextDept = '暂无'
  }

  //刷新页面
  refreshList() {
    this.doingTaskList = [];
    this.doneTaskList = [];
    this.getTrackListDataShowLoading();
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
  url: string;
  thumbImgPath: string = '';
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
  patientname: string = '';
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
  DelayBy: string = '';//催单状态
  delayByStr: string = '';
  isFirstPush: boolean = true;
  imgs: string = '';
  String6: string = '';
  CREATEDATE: string = '';
  MODIFYDATE: string = '';
  String1: string = '';
  String3: string = '';
  EmergencyLevel: string = '';
  AssignAt: string = '';
  Note: string = '';
  String10: string = ''; //检查项目
  String12: string = ''; //急诊/平诊标本运送
  constructor() {

  }

  getItemIcon(): string {
    switch (this.TargetType) {
      case '病人':
        return 'assets/imgs/icon-br.png';
      case '标本':
        return 'assets/imgs/icon-bb.png';
      case '药品':
        return 'assets/imgs/icon-yp.png';
      case '物品':
        return 'assets/imgs/icon-wz.png';
      default:
        return 'assets/imgs/icon-br.png';
    }
  }
}