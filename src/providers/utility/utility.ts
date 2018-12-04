import { Injectable } from '@angular/core';
import { ToastController, LoadingController, Loading, AlertController } from 'ionic-angular';

import { Camera, CameraOptions } from '@ionic-native/camera';

/*
  Generated class for the UtilityProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/

@Injectable()
export class UtilityProvider {

  myLoading: Loading;
  isLoadingShow: boolean = false;

  constructor(private toastCtrl: ToastController, 
    private loadingCtrl: LoadingController,
    private alert:AlertController,
    private camera:Camera
    ) {
    console.log('Hello UtilityProvider Provider');
  }


  private createLoading() {
    if (this.myLoading == null) {
      this.myLoading = this.loadingCtrl.create({
        spinner: 'crescent',
        enableBackdropDismiss: true
      });
    }
  }


  showLoading(msg: string) {
    if (this.myLoading == null) {
      this.createLoading();
    }
    if (!this.isLoadingShow) {
      this.myLoading.setContent(msg);
      this.myLoading.present();
      this.isLoadingShow = true;
    }
  }

  dismissLoading() {
    if (this.myLoading != null) {
      this.myLoading.dismiss();
      this.myLoading = null;
      this.isLoadingShow = false;
    }
  }

  showToast(msg: string, position: TOAST_POSITION, duration?: number, onDismiss?: () => void) {
    let toast = this.toastCtrl.create({
      message: msg,
      position: position,
      duration: duration ? duration : 2500
    });
    if (onDismiss) {
      toast.onDidDismiss(onDismiss);
    }
    toast.present();
  }

  showAlert(title:string, msg:string, cancelTxt:string) {
    let alertWindow = this.alert.create({
      title:title,
      message:msg,
      buttons:[
        {
          text:cancelTxt,
          role:'cancel'
        }
      ]
    });
    alertWindow.present();
  }

  showAlertOneBtn(title:string, msg:string, cancelTxt:string, okhandler:(value: any) => boolean | void) {
    let alertWindow = this.alert.create({
      title:title,
      message:msg,
      buttons:[
        {
          text:cancelTxt,
          role:'cancel',
          handler:okhandler
        }
      ]
    });
    alertWindow.present();
  }

  showAlertWithOkhandler(title:string, msg:string, cancelTxt:string, okText:string, okhandler:(value: any) => boolean | void) {
    let alertWindow = this.alert.create({
      title:title,
      message:msg,
      buttons:[
        {
          text:cancelTxt,
          role:'cancel'
        },
        {
          text:okText,
          handler:okhandler
        }
      ]
    });
    alertWindow.present();
  }

  /**
   * 接口时间字段，标准时间格式：2018-09-28 19:09:29
   * @param time 
   */
  formatAPIDate(time: number): string {
    const Dates = new Date(time);
    const year: number = Dates.getFullYear();
    const month: any = (Dates.getMonth() + 1) < 10 ? '0' + (Dates.getMonth() + 1) : (Dates.getMonth() + 1);
    const day: any = Dates.getDate() < 10 ? '0' + Dates.getDate() : Dates.getDate();
    const HH: any = Dates.getHours() < 10 ? '0' + Dates.getHours() : Dates.getHours();
    const mm: any = Dates.getMinutes() < 10 ? '0' + Dates.getMinutes() : Dates.getMinutes();
    const ss: any = Dates.getSeconds() < 10 ? '0' + Dates.getSeconds() : Dates.getSeconds();
    const result = year + '-' + month + '-' + day + " " + HH + ":" + mm + ':' + ss;
    return result;
  }

  /**
     * 转换时间格式为YYYY-MM-DD HH:mm
     */
  formatDateYYYYMMDDHHMM(time: number): string {
    const Dates = new Date(time);
    const year: number = Dates.getFullYear();
    const month: any = (Dates.getMonth() + 1) < 10 ? '0' + (Dates.getMonth() + 1) : (Dates.getMonth() + 1);
    const day: any = Dates.getDate() < 10 ? '0' + Dates.getDate() : Dates.getDate();
    const HH: any = Dates.getHours() < 10 ? '0' + Dates.getHours() : Dates.getHours();
    const mm: any = Dates.getMinutes() < 10 ? '0' + Dates.getMinutes() : Dates.getMinutes();
    const result = year + '-' + month + '-' + day + " " + HH + ":" + mm;
    return result;
  }

  /**
   * 获取相册图片
   */
  getPictureFromGallery(): Promise<Object[]> {
    return new Promise((resolve, reject) => {
      let args = {
        'selectMode': 100, //101=picker image and video , 100=image , 102=video
        'maxSelectCount': 4, //default 40 (Optional)
        'maxSelectSize': 52428800, //50M (Optional)
      };
      (<any>window).MediaPicker.getMedias(args, (medias => {
        if (medias.length == 0) {
          reject('请选择一张图片上传');
        }
        resolve(medias);
      }))
    });
  }

  /**
   * 压缩图片
   * @param Media 
   */
  compressImage(Media) {
    return new Promise((resolve, reject) => {
      (<any>window).MediaPicker.compressImage(Media, (data) => {
        resolve(data);
      });
    });
  }

  /**
   * 获取略缩图
   * @param Media 
   */
  getThumbnail(media): Promise<Object> {
    return new Promise((resolve, reject) => {
      (<any>window).MediaPicker.extractThumbnail(media, (data) => {
        resolve(data);
      });
    });
  }

  takePhoto():Promise<string> {

    return new Promise((resovle, reject)=>{
      const CAMERA_OPTIONS: CameraOptions = {
        quality: 85,
        destinationType: this.camera.DestinationType.DATA_URL,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE
      }
  
      this.camera.getPicture(CAMERA_OPTIONS).then((imageData) => {
        if(imageData) {
          resovle(imageData);
        }
       }, (err) => {
          reject(err);
       });
    });
    
  }

  /**
   * 日期对象转为日期字符串
   * @param date 需要格式化的日期对象
   * @param sFormat 输出格式,默认为yyyy-MM-dd                        年：y，月：M，日：d，时：h，分：m，秒：s
   * @example  dateFormat(new Date())                               "2017-02-28"
   * @example  dateFormat(new Date(),'yyyy-MM-dd')                  "2017-02-28"
   * @example  dateFormat(new Date(),'yyyy-MM-dd HH:mm:ss')         "2017-02-28 13:24:00"   ps:HH:24小时制
   * @example  dateFormat(new Date(),'yyyy-MM-dd hh:mm:ss')         "2017-02-28 01:24:00"   ps:hh:12小时制
   * @example  dateFormat(new Date(),'hh:mm')                       "09:24"
   * @example  dateFormat(new Date(),'yyyy-MM-ddTHH:mm:ss+08:00')   "2017-02-28T13:24:00+08:00"
   * @example  dateFormat(new Date('2017-02-28 13:24:00'),'yyyy-MM-ddTHH:mm:ss+08:00')   "2017-02-28T13:24:00+08:00"
   * @returns {string}
   */
  dateFormat(date: Date, sFormat: String = 'yyyy-MM-dd'): string {
    let time = {
      Year: 0,
      TYear: '0',
      Month: 0,
      TMonth: '0',
      Day: 0,
      TDay: '0',
      Hour: 0,
      THour: '0',
      hour: 0,
      Thour: '0',
      Minute: 0,
      TMinute: '0',
      Second: 0,
      TSecond: '0',
      Millisecond: 0
    };
    time.Year = date.getFullYear();
    time.TYear = String(time.Year).substr(2);
    time.Month = date.getMonth() + 1;
    time.TMonth = time.Month < 10 ? "0" + time.Month : String(time.Month);
    time.Day = date.getDate();
    time.TDay = time.Day < 10 ? "0" + time.Day : String(time.Day);
    time.Hour = date.getHours();
    time.THour = time.Hour < 10 ? "0" + time.Hour : String(time.Hour);
    time.hour = time.Hour < 13 ? time.Hour : time.Hour - 12;
    time.Thour = time.hour < 10 ? "0" + time.hour : String(time.hour);
    time.Minute = date.getMinutes();
    time.TMinute = time.Minute < 10 ? "0" + time.Minute : String(time.Minute);
    time.Second = date.getSeconds();
    time.TSecond = time.Second < 10 ? "0" + time.Second : String(time.Second);
    time.Millisecond = date.getMilliseconds();

    return sFormat.replace(/yyyy/ig, String(time.Year))
      .replace(/yyy/ig, String(time.Year))
      .replace(/yy/ig, time.TYear)
      .replace(/y/ig, time.TYear)
      .replace(/MM/g, time.TMonth)
      .replace(/M/g, String(time.Month))
      .replace(/dd/ig, time.TDay)
      .replace(/d/ig, String(time.Day))
      .replace(/HH/g, time.THour)
      .replace(/H/g, String(time.Hour))
      .replace(/hh/g, time.Thour)
      .replace(/h/g, String(time.hour))
      .replace(/mm/g, time.TMinute)
      .replace(/m/g, String(time.Minute))
      .replace(/ss/ig, time.TSecond)
      .replace(/s/ig, String(time.Second))
      .replace(/fff/ig, String(time.Millisecond))
  }

}



export const enum TOAST_POSITION {
  MIDDLE = 'middle',
  TOP = 'top',
  BOTTOM = 'bottom'
}

export interface AlertOkOption {
    okText?: string;
    handler?: (value: any) => boolean | void;
}