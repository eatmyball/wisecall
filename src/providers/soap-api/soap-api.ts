import { UtilityProvider } from './../utility/utility';

import { Injectable } from '@angular/core';
import { ApiProvider } from '../api/api';

/*
  Generated class for the SoapApiProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class SoapApiProvider {

  version:string = '0.0.1(2019032501)';

  HOSPITALCODE:string = '03013';

  // BASE_URL = 'http://123.206.111.21/htmwstest/';
  // BASE_URL = 'http://info.liontown.cn/htmwsforpadprd/';
  BASE_URL = 'http://happyship.wisebox.com.cn/htmwsforpadprd/'; 

  //缩略图路径
  THUMB_URL = this.BASE_URL+'uploadimage/';

  BASE_API_URL = this.BASE_URL+'wsformicromsg.asmx?wsdl';

  userInfo:Object = null;

  constructor(
      private api:ApiProvider,
      private util:UtilityProvider
    ) {

  }

  /**
   * 用户登录
   * @param formdata
   */
  public userLogin(formdata:Object) {
    return this.doSoapByActionName('Login',JSON.stringify(formdata))
  }

  /**
   * 获取追踪任务列表
   */
  public getTrackList() {
    let params = {};
    params['HospitalCode'] = this.HOSPITALCODE;
    params['DeptCode'] = this.userInfo['DeptCode'];
    params['OperatorCode'] = '';
    params['BillType'] = '即时';
    let now = new Date();
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    let start = this.util.formatAPIDate(now.getTime());
    let end = this.util.formatAPIDate(now.getTime() + 24*60*60*1000); //时间跨度为一天
    params['DateTimeFrom'] = start;
    params['DateTimeTo'] = end;
    return this.doSoapByActionName('GetTransferTasksByHospitalDeptPersonCode',JSON.stringify(params));
  }
  
  /**
   * 上传base64形式文件
   * @param base64 
   * @param name 
   */
  public uploadFile(base64:string, name:string) {
    return this.uploadFileByName(base64, name);
  }

  /**
   * 设置登录后的用户信息
   * @param data
   */
  public setUserInfo(data) {
    this.userInfo = data;
  }

  /**
   * 根据登录用户设置医院code
   * @param code 
   */
  public setHosipitalCode(code:string) {
    if(code) {
      this.HOSPITALCODE = code;
    }
    
  }

  /**
   * 创建病人运送单
   * @param formdata 
   */
  public createTransferTask(formdata:Object) {
    return this.doSoapByActionName('NewTransferTaskForiPad',JSON.stringify(formdata));
  }


  /**
   * 取消任务
   * @param params 
   */
  public CancelTransferTask(billNo:string){
    let params = {"TransferTaskBillNo": billNo,"CancelReason":"cancel","CanceledByCode":this.userInfo['Account'], "CanceledDatetime":this.util.formatAPIDate(new Date().getTime())}
    return this.doSoapByActionName('CancelTransferTask',JSON.stringify(params));
  }

  /**
   * 查询医院的科室与检查项目
   */
  public GetCheckItemByHospitalDeptCodeForIpad():Promise<Object> {
    let params = {"HospitalCode": this.HOSPITALCODE,"DeptCode":""};
    return this.doSoapByActionName('GetCheckItemByHospitalDeptCodeForiPad', JSON.stringify(params));
  }

  /**
   * 获取运送工具接口
   */
  public GetTransferTools():Promise<Object> {
    return this.doSoapByActionName('GetTransferTools','{"PropType": "20"}');
  }

  /**
   * 查询医院的药品分类与药房
   */
  public GetDrugTypeByHospitalDeptCode():Promise<Object> {
    let params = {"HospitalCode": this.HOSPITALCODE,"DeptCode":""};
    return this.doSoapByActionName('GetDrugTypeByHospitalDeptCode', JSON.stringify(params));
  }

  /**
   * 催单
   */
  public PushTransferTaskByID(transferTaskBillNo:string):Promise<Object> {
    let param =  { TransferTaskBillNo: transferTaskBillNo};
    return this.doSoapByActionName('PressATransferTask',JSON.stringify(param));
  }

  private uploadFileByName(base64, name:string) {
    return new Promise((resolve, reject)=>{
      let body = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
      <soapenv:Header/>
      <soapenv:Body>
         <tem:UpLoadFile >
            <tem:content>
            ${base64}
            </tem:content>
            <tem:pathandname>
            ${name}
            </tem:pathandname>
         </tem:UpLoadFile >
      </soapenv:Body>
   </soapenv:Envelope>`
  
      this.api.Post(this.BASE_API_URL,body).then(data=>{
          let valueObj = this.getDomValue(data,'UpLoadFileResult');
          if(valueObj['flag']) {
            let result = valueObj['value'];
            if(result) {
              console.log('UploadFile result:'+result);
              resolve(JSON.parse(result));
            }else {
              reject('接口异常请稍后再试');
            }
          }else {
            reject(valueObj['msg']);
          }
      }).catch(error=>{
        reject(error);
      });
    });
  }

  private doSoapByActionName(actionName:string, data:string):Promise<Object> {
    console.log(actionName + ' params:'+ data);
    return new Promise((resolve, reject)=>{
      let body = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
      <soapenv:Header/>
      <soapenv:Body>
         <tem:${actionName}>
            <tem:strParameter>
            ${data}
            </tem:strParameter>
         </tem:${actionName}>
      </soapenv:Body>
   </soapenv:Envelope>`
  
      this.api.Post(this.BASE_API_URL,body).then(data=>{
          let valueObj = this.getDomValue(data, actionName+'Result');
          if(valueObj['flag']) {
            let result = valueObj['value'];
            if(result) {
              console.log(actionName+' result:'+result);
              resolve(JSON.parse(result));
            }else {
              reject('接口异常请稍后再试');
            }
          }else {
            reject(valueObj['msg']);
          }
      }).catch(error=>{
        reject(error);
      });
    });
  }

  private getDomValue(data,key:string):Object {
    if(data){
      let dom = data['_body'];
      if(dom) {
        let parser = new DOMParser();
        let doc = parser.parseFromString(dom,'text/xml');
        let list = doc.getElementsByTagName(key);
        if(list.length > 0) {
          let itemValue = list[0].innerHTML;
          return {flag:true,msg:'',value:itemValue};
        }else {
          return {flag:true,msg:'',value:''};
        }
      }else {
        return {flag:false,msg:'接口异常请稍后再试',value:''};
      }
    }else {
      return {flag:false,msg:'接口异常请稍后再试',value:''};
    }
  }

}


