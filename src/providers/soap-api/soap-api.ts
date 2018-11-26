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

  BASE_URL = 'http://123.206.111.21/htmwstest/';

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
    // let data = {"HospitalCode": "03023","DeptCode":"03023010403", 
    // "OperatorCode":"0302320015", 
    // "DateTimeFrom":"2018-09-23 00:00:00","DateTimeTo":"2018-09-23 23:00:00"}
    let params = {};
    params['HospitalCode'] = '03023';
    params['DeptCode'] = this.userInfo['DeptCode'];
    params['OperatorCode'] = '';
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
   * 创建病人运送单
   * @param formdata 
   */
  public createPatientTransferTask(formdata:Object) {
    return this.doSoapByActionName('NewTransferTaskForiPad',JSON.stringify(formdata));
  }

  /**
   * 查询医院的科室与检查项目
   */
  public GetCheckItemByHospitalDeptCode():Promise<Object> {
    return this.doSoapByActionName('GetCheckItemByHospitalDeptCode','{"HospitalCode": "03023","DeptCode":""}');
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
    return this.doSoapByActionName('GetDrugTypeByHospitalDeptCode','{"HospitalCode": "03023","DeptCode":""}');
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


