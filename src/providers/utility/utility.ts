import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastController, LoadingController, Loading } from 'ionic-angular';

/*
  Generated class for the UtilityProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class UtilityProvider {

  myLoading: Loading;
  isLoadingShow: boolean = false;

  constructor(private toastCtrl: ToastController, private loadingCtrl: LoadingController) {
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
  getPictureFromGallery(): Promise<Object> {
    return new Promise((resolve, reject) => {
      let args = {
        'selectMode': 100, //101=picker image and video , 100=image , 102=video
        'maxSelectCount': 5, //default 40 (Optional)
        'maxSelectSize': 52428800, //50M (Optional)
      };
      (<any>window).MediaPicker.getMedias(args, (medias => {
        if (medias.length == 0) {
          reject('请选择一张图片上传');
        }
        //[{mediaType: "image", path:'/storage/emulated/0/DCIM/Camera/2017.jpg', uri:"android retrun uri,ios retrun URL" size: 21993}]
        resolve(medias);
      }))
    });
  }

  /**
   * 压缩图片
   * @param Media 
   */
  compressImage(Media): Promise<Object> {
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

}



export const enum TOAST_POSITION {
  MIDDLE = 'middle',
  TOP = 'top',
  BOTTOM = 'bottom'
}