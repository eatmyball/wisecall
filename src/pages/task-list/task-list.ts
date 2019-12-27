import { URLSearchParams } from '@angular/http';
import { UtilityProvider, TOAST_POSITION } from './../../providers/utility/utility';
import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController, Scroll, Platform, DateTime, AlertController } from 'ionic-angular';
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

const TRANSPORT_TOOLS = [{ dictCode: '', dictName: '轮椅', isChecked: true }, { dictCode: '', dictName: '平车', isChecked: false },
{ dictCode: '', dictName: '拉床', isChecked: false }, { dictCode: '', dictName: '步行', isChecked: false }];

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

  loginDepartName:string = ''; //当前登录用户科室名称


  //病人运送表单内容
  //床号
  bedNum: string = ''
  //病人姓名
  patientName: string = '';
  //病人腕带号
  patientWristband: string = '';
  //病人年龄
  age: string = '';
  birthDay: string = '';
  birthForshow: string = '';
  //检查项目
  checkOptionArray = [];
  //运送工具
  transportTools = [];
  transportOption: string = '轮椅';
  specimenTypes = [];
  specimenTypeStr = '';
  //预约时间
  checkDate: string = '';
  dateTimeForShow: string = '';
  //选择的照片
  picArray = [];
  //备注
  comments: string = '';

  isEmergency: boolean = true;

  //送药运送表单内容
  drugTypies = [];

  //全部科室列表
  departmentList = [];
  
  //标本运送目标科室
  specimenToDeparts = [{departmentCode:'01005A00008',departmentName:'急诊检验科',isChecked: false},
  {departmentCode:'01005A00009',departmentName:'医学检验科',isChecked: false},
  {departmentCode:'01005A00010',departmentName:'风湿免疫科',isChecked: false},
  {departmentCode:'01005A00013',departmentName:'病理科',isChecked: false},
  {departmentCode:'01005A00005',departmentName:'核医学',isChecked: false},
  {departmentCode:'01005A00038',departmentName:'输血科',isChecked: false}];

  tolocationName: string = '';

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
  commodityNum: number = 0;
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
    private api: SoapApiProvider,
    private platform: Platform,
    private alertCtrl: AlertController
  ) {
    // this.initDefaultTime();
    this.checkOptionArray = this.navParams.get('data');
  }


  ionViewDidLoad() {
    console.log('ionViewDidLoad TaskListPage');

    this.initBaseDatas();
    //获取列表数据
    this.getTrackListDataShowLoading();
    this.loginDepartName = this.api.userInfo.departmentName;
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
    this.getTransferTools();
    this.getSpecimenAndDrugTypies();
    this.getDepartmentByHospitalDept();
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
  getTransferTools() {
    this.api.GetTransferTools().then(data => {
      if (data) {
        for (let index in data) {
          let transportItem = {};
          transportItem['dictCode'] = data[index]['dictCode'];
          transportItem['dictName'] = data[index]['dictName'];
          transportItem['isChecked'] = false;
          this.transportTools.push(transportItem);

        }
      }
    }).catch(error => {
      this.transportTools = TRANSPORT_TOOLS;
    });
  }

  getSpecimenAndDrugTypies() {
    this.api.getTransferItemByHospital().then(data => {
      if (data) {
        for (let index in data) {
          if(data[index]['transferType'] == '标本') {
            let specimenType = {};
            specimenType['sampleName'] = data[index]['transferItemName'];
            specimenType['departmentName'] = '肺功能检查室';
            specimenType['isChecked'] = false;
            this.specimenTypes.push(specimenType);
          }else if(data[index]['transferType'] == '药品'){
            let drugType = {};
            drugType['medicineName'] = data[index]['transferItemName'];
            if (index == '0') {
              drugType['isChecked'] = true;
            } else {
              drugType['isChecked'] = false;
            }
            this.drugTypies.push(drugType);
          }
          
        }
      }
    }).catch(error => {
      this.specimenTypes = TRANSPORT_TOOLS;
    });
  }

  //获取医院科室列表
  getDepartmentByHospitalDept() {
    this.api.getDepartmentList().then(data => {
      if (data) {
        for (let index in data) {
          let department = {};
          department['departmentCode'] = data[index]['departmentCode'];
          department['departmentName'] = data[index]['departmentName'];
          department['isChecked'] = false;
          this.departmentList.push(department);
        }
      }
    }).catch(error => {
    });
  }

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
        for (let index in data) {
          let item = new TaskListItemModel();
          item.billNo = data[index]['billNo'];
          item.transferType = data[index]['transferType'];
          item.transferTool = data[index]['transferTool'];
          item.transferItem = data[index]['transferItem'];
          item.fromLocationCode = data[index]['fromLocationCode'];
          item.fromLocationName = data[index]['fromLocationName'];
          item.sickbed = data[index]['sickbed'];
          item.toLocationCode = data[index]['toLocationCode'];
          item.toLocationName = data[index]['toLocationName'];
          item.patientNo = data[index]['patientNo'];
          item.patientName = data[index]['patientName'];
          item.patientSex = data[index]['patientSex'];
          item.quantity = data[index]['quantity'];
          item.useband = data[index]['useband'];
          item.patientAge = data[index]['patientAge'];
          item.inspectionItem = data[index]['inspectionItem'];
          item.operatorCode = data[index]['operatorCode'];
          item.operatorName = data[index]['operatorName'];

          item.createTime = data[index]['createTime'];
          item.assignTime = data[index]['assignTime'];
          item.acceptTime = data[index]['acceptTime'];
          item.appointmentTime = data[index]['appointmentTime'];
          item.emergencyLevel = data[index]['emergencyLevel'];
          item.remark = data[index]['remark'];
          item.urgeTime = data[index]['urgeTime'];
          item.urgeReason = data[index]['urgeReason'];
          item.urgeTime = data[index]['urgeTime'];
          item.quatity = data[index]['quatity'];
          if (item.urgeReason) {
            if (item.urgeReason == '催单') {
              item.isFirstPush = true;
            } else {
              item.isFirstPush = false;
            }
          }
          item.status = data[index]['status'];
          if (item.status === '完工' || item.status === '取消') {
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
      if (!this.bedNum) {
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
            this.showAlert('创建成功');
            this.resetFormData();
            this.getTrackListData(); //刷新列表
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
  onSpecimenTransport() {
    //标本运送
      this.util.showAlertWithOkhandler('提示', '是否创建' + '标本运送任务', '否', '是', (data) => {

        let isChecked = false;
        for (let index in this.specimenTypes) {
          let item = this.specimenTypes[index];
          if (item['isChecked']) {
            isChecked = true;
          }
        }
        if (isChecked) {
          this.util.showLoading('创建任务中,请稍候...');
          let params = this.getTransferDataForm(TRANSPORT_SPECIMEN);
          this.api.createTransferTask(params).then(result => {
            this.util.dismissLoading();
            this.showAlert('创建成功');
            this.getTrackListData(); //刷新列表
            this.resetFormData();
          }).catch(error => {
            this.util.dismissLoading();
            this.showAlert('创建失败,请稍后重试！');
          })
        } else {
          this.showAlert('请至少选择一种标本类型!');
        }
      });
  }

  //药品运送
  onDrugTransferClicked() {
    this.util.showAlertWithOkhandler('提示', '是否创建药品运送任务', '否', '是', (data) => {
      let params = this.getTransferDataForm(TRANSPORT_DRUG);
      this.util.showLoading('创建任务中,请稍候...');
      this.api.createTransferTask(params).then(result => {
        this.util.dismissLoading();

        this.showAlert('创建成功');
        this.getTrackListData(); //刷新列表
        this.resetFormData();
      }).catch(error => {
        this.util.dismissLoading();
        this.showAlert('创建失败,请稍后重试！');
      })
    });
  }

  //物品运送
  onCommodityTransferClicked(isSend) {
    if (this.otherCommodity && this.commodityNum) {
      if (!isNaN(this.commodityNum)) {
        this.util.showLoading('创建任务中,请稍候...');
        setTimeout(() => {
          let data = this.getTransferDataForm(TRANSPORT_COMMODITY);
          this.api.createTransferTask(data).then(result => {
            this.util.dismissLoading();
            this.showAlert('创建成功');
            this.resetFormData();
            this.getTrackListData(); //刷新列表

          }).catch(error => {
            this.util.dismissLoading();
            this.showAlert('创建失败,请稍后重试！');
          });
        }, 500);
      } else {
        this.showAlert('数量必须为数字!');
      }
    } else {
      this.showAlert('必须输入物品名称和数量!');
    }

  }

  //标本运送催单
  // onSpecimenPushTask() {
  //   this.util.showAlertWithOkhandler(
  //     '提示', '确认是否催单', '取消', '确认', (data) => {
  //       this.util.showLoading('正在提交,请稍候...');
  //       setTimeout(() => {
  //         this.api.PushTransferTaskByID('').then(data => {
  //           this.util.dismissLoading();
  //           if (data) {
  //             this.showAlert('催单成功');
  //             this.getTrackListData();
  //           } else {
  //             this.showAlert(JSON.stringify(data));
  //           }
  //         }).catch(error => {
  //           this.util.dismissLoading();
  //           this.showAlert(JSON.stringify(error));
  //         });
  //       }, 500);
  //     }
  //   );
  // }

  //运送任务表单结构
  getTransferDataForm(transferType: string): URLSearchParams {
    let body = new URLSearchParams();
    body.append("hospitalCode", this.api.HOSPITALCODE);
    body.append("patientOld", "");
    body.append("emergencyLevel", "3");
    body.append("isNeedGenerateBack", "false");
    body.append("createdByCode", this.api.userInfo.userName);
    body.append("fromLocationName", "");
    body.append("targetType", "");
    body.append("transferTools", "");
    body.append("fromSickbed", "");
    body.append("patientName", "");
    body.append("patientNo", "");
    body.append("patientSex", "男");
    body.append("toLocationName", "");
    body.append("note", "");
    body.append("inspectionItem", "");
    body.append("checkTime", this.util.formatAPIDate(new Date().getTime()));
    body.append("billType", "即时");
    body.append("assignAlertBefore", "5");
    body.append("executeAlertBefore", "10");
    body.append("standardLength", "15");
    body.append("transferItem", "");
    body.append('quatity', '');
    switch (transferType) {
      //病人运送
      case TRANSPORT_PATIENT:
        body.set("fromLocationName", this.api.userInfo.departmentName);
        body.set("targetType", "病人");
        body.set("transferTools", this.transportOption);
        body.set("fromSickbed", this.bedNum);
        body.set("patientName", this.patientName);
        body.set("patientNo", this.patientWristband);
        body.set("patientOld", this.age);
        let checkDateStr = ''
        if (this.checkDate) {
          checkDateStr = this.util.formatAPIDate(new Date(this.checkDate).getTime());
        }
        //如果用户没有选择时间，给一个默认初始时间

        body.set("checkTime", checkDateStr ? checkDateStr : this.util.formatAPIDate(0));
        let toLocation = '';
        let checkOptions = '';
        for (let index in this.checkOptionArray) {
          let item = this.checkOptionArray[index];
          if (item['isChecked']) {
            toLocation += item['departmentName'] + ',';
            checkOptions += item['inspectionItemName'] + ','
          }

        }
        toLocation = toLocation.substring(0, toLocation.length - 1);
        checkOptions = checkOptions.substring(0, checkOptions.length - 1);
        body.set("fromLocationName", this.api.userInfo.departmentName);
        body.set("toLocationName", toLocation);
        // 用户生日放在备注最后
        body.set("note", this.comments);
        body.set("inspectionItem", checkOptions);
        break;
        //标本运送
      case TRANSPORT_SPECIMEN:
        let specimenType = {};
        for (let index in this.specimenTypes) {
          let item = this.specimenTypes[index];
          if (item['isChecked']) {
            specimenType = item;
          }
        }
        let toLocationStr = '';
        for(let index in this.specimenToDeparts) {
          let item = this.specimenToDeparts[index];
          if (item['isChecked']) {
            toLocationStr += item['departmentName'] + ',';
          }
        }
        if(toLocationStr) {
          toLocationStr = toLocationStr.substring(0, toLocationStr.length - 1);
        }
        body.set("targetType", "标本");
        body.set("transferItem", specimenType['sampleName']);
        body.set("fromLocationName", this.api.userInfo.departmentName);
        body.set("toLocationName", toLocationStr);
        break;
        //药品运送
      case TRANSPORT_DRUG:
        let drugType = '';
        for (let index in this.drugTypies) {
          let item = this.drugTypies[index];
          if (item['isChecked']) {
            drugType = item['medicineName'];
          }
        }
        body.set("targetType", "药品");
        body.set("transferItem", drugType != null ? drugType : '住院药');
        //药品运送起始科室都是当前科室
        body.set("fromLocationName", this.api.userInfo.departmentName);
        body.set("toLocationName", this.api.userInfo.departmentName);
        break;
        //物品运送
      case TRANSPORT_COMMODITY:
        body.set("targetType", "物品");
        body.set('quatity', this.commodityNum+'');
        body.set("transferItem", this.otherCommodity);
        body.set("fromLocationName", this.api.userInfo.departmentName);
        body.set("toLocationName", this.tolocationName);
        body.set("note", this.commodityComments);

        break;
    }

    return body;
  }

  onListSegClicked(isDoing) {
    if (isDoing) {
      this.segSelect = SEG_DOING;
    } else {
      this.segSelect = SEG_DONE;
    }
  }

  //检查项选择，单选
  onCheckItemClicked(index) {
    for (let i in this.checkOptionArray) {
      let item = this.checkOptionArray[i];
      if (Number(i) === index) {
        item.isChecked = true;
      } else {
        item.isChecked = false;
      }
    }
  }

  onTransferToolsClicked(index) {
    for (let i in this.transportTools) {
      let item = this.transportTools[i];
      if (Number(i) === index) {
        item.isChecked = true;
        this.transportOption = item['dictName'];
      } else {
        item.isChecked = false;
      }
    }

  }

  onSpecimenTypesClicked(index) {
    for (let i in this.specimenTypes) {
      let item = this.specimenTypes[i];
      if (Number(i) === index) {
        item.isChecked = true;
      } else {
        item.isChecked = false;
      }
    }

  }

  onDrugTypesClicked(index) {
    for (let i in this.drugTypies) {
      let item = this.drugTypies[i];
      if (Number(i) === index) {
        item.isChecked = true;
      } else {
        item.isChecked = false;
      }
    }

  }

    //目的科室选择
    onToDepartmentSelected(index) {
      for (let i in this.departmentList) {
        let item = this.departmentList[i];
        if (Number(i) === index) {
          item.isChecked = true;
          this.tolocationName = item['departmentName'];
        } else {
          item.isChecked = false;
        }
      }
    }

    //标本运送目的科室选择（可多选）
    onMultiToDepartmentSelected(index) {
      for (let i in this.specimenToDeparts) {
        let item = this.specimenToDeparts[i];
        if (Number(i) === index) {
          item.isChecked = !item.isChecked;
        }
      }
    }


  takePhoto() {
    //   this.util.takePhoto().then(data => {
    //     if (data) {
    //       this.uploadPicture(data);
    //     } else {
    //       this.util.showToast('获取照片失败，请稍候重试!', TOAST_POSITION.MIDDLE);
    //     }
    //   }).catch(error => {
    //     console.log('Camera error:' + JSON.stringify(error, Object.getOwnPropertyNames(error)));
    //     this.util.showToast('获取照片失败，请稍候重试!', TOAST_POSITION.MIDDLE);
    //   });
    // }

    // uploadPicture(data: string) {
    //   this.util.showLoading('上传照片中,请稍候...');
    //   setTimeout(() => {
    //     let name = new Date().getTime() + '.jpg'
    //     this.api.uploadFile(data, name).then(data => {
    //       this.util.dismissLoading();
    //       if (data['Flag'] === 'S') {
    //         let pic = new PictureForUpload();
    //         pic.name = name;
    //         pic.thumbImgPath = this.api.THUMB_URL + pic.name;
    //         pic.url = this.api.BASE_URL + pic.name;
    //         this.picArray.push(pic);
    //       } else {
    //         this.showAlert('上传失败，请稍后重试！');
    //       }
    //     }).catch(error => {
    //       this.util.dismissLoading();
    //       console.log('Upload error:' + JSON.stringify(error, Object.getOwnPropertyNames(error)));
    //       this.showAlert('' + error);
    //     });
    //   }, 200);
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
    //病人生日
    this.birthDay = '';
    this.birthForshow = '';
    this.transportOption = '';
    //检查项目
    this.checkOptionArray.forEach((item, index) => {
      item['isChecked'] = false;
    });
    //标本类型
    this.specimenTypes.forEach((item, index) => {
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
    this.tolocationName = '';
    //物品运送备注
    this.commodityComments = '';
    this.otherCommodity = '';
    this.commodityNum = 0;
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
      if (this.timepicker) {
        this.timepicker.open();
      }
    }, 100);
  }

  onBirthDateClicked() {
    setTimeout(() => {
      if (this.timepicker2) {
        this.timepicker2.open();
      }
    }, 100);
  }

  onDateTimeChanged() {
    this.dateTimeForShow = this.util.formatDateYYYYMMDDHHMM(new Date(this.checkDate).getTime());
  }

  onBirthdayChanged() {
    this.birthForshow = this.util.dateFormat(new Date(this.birthDay), 'yyyy-MM-dd');
  }

  onToLocationSelected() {
    let alert = this.alertCtrl.create();
    alert.setTitle("请选择目的科室");
    for (let index in this.departmentList) {
      let item = this.departmentList[index];
      alert.addInput({
        type: 'radio',
        label: item['departmentName'],
        value: item['departmentName'],
        checked: item['isChecked']
      });
    }
    alert.addButton('取消');
    alert.addButton({
      text: '确定',
      handler: data => {
        this.tolocationName = data;
        for (let i in this.departmentList) {
          let item = this.departmentList[i];
          if (this.tolocationName == item['departmentName']) {
            item['isChecked'] = true;
          } else {
            item['isChecked'] = false;
          }
        }
      }
    });
    alert.present();
  }
  

  //催单
  pushTransferBill(event, item: TaskListItemModel) {
    event.stopPropagation();
    this.util.showAlertWithOkhandler(
      '提示', '确认是否催单', '取消', '确认', (data) => {
        this.util.showLoading('正在提交,请稍候...');
        setTimeout(() => {
          let reason = '';
          if (!item.urgeReason) {
            reason = '催单';
          } else {
            if (item.urgeReason == '催单') {
              reason = '再催';
            } else {
              reason = '再催';
            }
          }
          this.api.PushTransferTaskByID(item.billNo, reason).then(data => {
            this.util.dismissLoading();
            this.showAlert('催单成功');
            this.getTrackListData();
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
          this.api.CancelTransferTask(item.billNo).then(data => {
            this.util.dismissLoading();
            this.showAlert('任务取消成功');
            this.getTrackListData();

          }).catch(error => {
            this.util.dismissLoading();
            this.showAlert(JSON.stringify(error));
          });
        }, 500);
      }
    );
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
  billNo: string = '';
  transferMode: string = '';
  transferType: string = '';
  transferItem: string = '';
  transferTool: string = '';
  fromLocationCode: string = '';
  fromLocationName: string = '';
  sickbed: string = '';
  toLocationCode: string = '';
  toLocationName: string = '';
  patientNo: string = '';
  patientName: string = '';
  patientSex: string = '';
  patientAge: string = '';
  status: string = '';
  operatorCode: string = '';
  operatorName: string = '';
  // ExecuteBy: string = '';
  // ExecuteStart: string = '';
  // ExecuteEnd: string = '';
  // RelatedBillNo: string = '';
  // DelayReason: string = '';
  // DelayAt: string = '';
  // CancelReason: string = '';
  // CancelBy: string = '';
  // DelegateReason: string = '';
  // DelegateBy: string = '';
  // DelegateAt: string = '';
  urgeReason: string = "催单";
  urgeUser: string = "01003008";
  urgeTime: string = "2019-11-15 15:57:26";
  isFirstPush: boolean = true;
  imgs: string = '';
  createTime: string = '';
  appointmentTime: string = '';
  assignTime: string = '';
  acceptTime: string = '';
  emergencyLevel: string = '';
  remark: string = '';
  quantity: string = '';
  useband: boolean = false;
  inspectionItem: string = ''; //检查项目
  quatity: string = ''; //物品数量
  constructor() {

  }

  getItemIcon(): string {
    switch (this.transferType) {
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