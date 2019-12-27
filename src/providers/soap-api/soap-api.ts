import { Http, Headers, URLSearchParams } from '@angular/http';
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

  version:string = '1.0.1(2019122701)';

  HOSPITALCODE:string = '03013';

  // BASE_URL = 'http://123.206.111.21/htmwstest/';
  // BASE_URL = 'http://info.liontown.cn/htmwsforpadprd/';
  // BASE_URL = '/kmfs/transfer/app/'; // 浏览器本地调试，开了proxy
  BASE_URL = 'http://106.14.61.156/kmfs/transfer/app/';

  //缩略图路径
  THUMB_URL = this.BASE_URL+'uploadimage/';

  BASE_API_URL = this.BASE_URL+'wsformicromsg.asmx?wsdl';

  userInfo:UserInfoObj = null;

  constructor(
      private api:Http,
      private util:UtilityProvider
    ) {
      this.userInfo = new UserInfoObj();
  }

  getUrlByActionName(action:string):string {
    let url = this.BASE_URL;
    switch (action) {
      case 'Login':
        return url + 'login';
      case 'GetTransferTasksByHospitalDeptPersonCode':
        return url + 'getTransferTasksByHospitalDeptPersonCode';
      case 'NewTransferTaskForiPad':
        return url + 'newTransferTask';
      case 'CancelTransferTask':
        return url + 'cancelTransferTask';
      case 'GetCheckItemByHospitalDeptCodeForiPad':
        return url + 'getCheckItemByHospitalDeptCode';
      case 'GetTransferTools':
        return url + 'getTransferTools';
      case 'PressATransferTask':
        return url + 'pressATransferTask';
      case 'getSamplesByHospitalCode':
        return url + 'getSamplesByHospitalCode';
      case 'getDepartmentsByHospitalCode':
        return url + 'getDepartmentsByHospitalCode';
      case 'getMedicinesByHospitalCode':
        return url+'getMedicinesByHospitalCode';
      case 'getTransferItemByHospital':
        return url+'getTransferItemsByHospitalCode'; 
      default:
        return url;
    }
  }

  /**
   * 用户登录
   * @param formdata
   */
  public userLogin(username:string, password:string) {
    let body = new URLSearchParams();
        body.append("username", username);
        body.append("password", password);
        
    return this.doSoapByActionName('Login',body)
  }

  /**
   * 获取追踪任务列表
   */
  public getTrackList() {
    let now = new Date();
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    let start = this.util.formatAPIDate(now.getTime());

    let body = new URLSearchParams();
        body.append("hospitalCode", this.HOSPITALCODE);
        body.append("deptCode", this.userInfo.departmentCode);
        body.append("operatorCode", '');
        body.append("dateTimeFrom", start);

    return this.doSoapByActionName('GetTransferTasksByHospitalDeptPersonCode',body);
  }
  
  /**
   * 上传base64形式文件
   * @param base64 
   * @param name 
   */
  // public uploadFile(base64:string, name:string) {
  //   return this.uploadFileByName(base64, name);
  // }

  /**
   * 设置登录后的用户信息
   * @param data
   */
  public setUserInfo(data) {
    if(data) {
      this.userInfo.realname = data['realname'];
      this.userInfo.roleName = data['roleName'];
      this.userInfo.orgCode = data['orgCode'];
      this.userInfo.orgName = data['orgName'];
      this.userInfo.postName = data['postName'];
      this.userInfo.departmentCode = data['departmentCode'];
      this.userInfo.departmentName = data['departmentName'];
    }
    
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
  public createTransferTask(formdata:URLSearchParams) {
    return this.doSoapByActionName('NewTransferTaskForiPad',formdata);
  }


  /**
   * 取消任务
   * @param params 
   */
  public CancelTransferTask(billNo:string){
   let body = new URLSearchParams();
    body.append('transferTaskBillNo',billNo);
    body.append('cancelReason','cancel');
    body.append('canceledByCode',this.userInfo.userName);
    return this.doSoapByActionName('CancelTransferTask',body);
  }

  /**
   * 查询医院的科室与检查项目
   */
  public GetCheckItemByHospitalDeptCodeForIpad():Promise<Object> {
    let body = new URLSearchParams();
    body.append('hospitalCode',this.HOSPITALCODE);
    return this.doSoapByActionName('GetCheckItemByHospitalDeptCodeForiPad', body);
  }

  /**
   * 获取运送工具接口
   */
  public GetTransferTools():Promise<Object> {
    let body = new URLSearchParams();
    return this.doSoapByActionName('GetTransferTools',body);
  }

  /**
   * 查询医院的药品分类与药房
   */
  public GetDrugTypeByHospitalDeptCode():Promise<Object> {
    let body = new URLSearchParams();
    body.append('hospitalCode',this.HOSPITALCODE);
    return this.doSoapByActionName('getMedicinesByHospitalCode', body);
  }

  /**
   * 催单
   */
  public PushTransferTaskByID(transferTaskBillNo:string, reason:string):Promise<Object> {
    let body = new URLSearchParams();
    body.append('transferTaskBillNo',transferTaskBillNo);
    body.append('finishReason',reason);
    body.append('finishedByCode',this.userInfo.userName);
    return this.doSoapByActionName('PressATransferTask',body);
  }

  /**
   * 查询标本类型
   */
  public getSpecimenTypeByHospitalCode():Promise<Object> {
    let body = new URLSearchParams();
    body.append('hospitalCode',this.HOSPITALCODE);
    return this.doSoapByActionName('getSamplesByHospitalCode',body);
  }

  /**
   * 查询医院的科室类型
   */
  public getDepartmentList():Promise<Object> {
    let body = new URLSearchParams();
    body.append('hospitalCode',this.HOSPITALCODE);
    return this.doSoapByActionName('getDepartmentsByHospitalCode', body);
  }

  /**
   * 查询标本、药品运送子类型
   */
  public getTransferItemByHospital():Promise<Object> {
    let body = new URLSearchParams();
    body.append('hospitalCode',this.HOSPITALCODE);
    return this.doSoapByActionName('getTransferItemByHospital', body);
  }
   

  // private uploadFileByName(base64, name:string) {
  //   return new Promise((resolve, reject)=>{
  //     let body = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
  //     <soapenv:Header/>
  //     <soapenv:Body>
  //        <tem:UpLoadFile >
  //           <tem:content>
  //           ${base64}
  //           </tem:content>
  //           <tem:pathandname>
  //           ${name}
  //           </tem:pathandname>
  //        </tem:UpLoadFile >
  //     </soapenv:Body>
  //  </soapenv:Envelope>`
  
  //     this.api.Post(this.BASE_API_URL,body).then(data=>{
  //         let valueObj = this.getDomValue(data,'UpLoadFileResult');
  //         if(valueObj['flag']) {
  //           let result = valueObj['value'];
  //           if(result) {
  //             console.log('UploadFile result:'+result);
  //             resolve(JSON.parse(result));
  //           }else {
  //             reject('接口异常请稍后再试');
  //           }
  //         }else {
  //           reject(valueObj['msg']);
  //         }
  //     }).catch(error=>{
  //       reject(error);
  //     });
  //   });
  // }

  // private doSoapByActionName(actionName:string, data:string):Promise<Object> {
  //   console.log(actionName + ' params:'+ data);
  //   return new Promise((resolve, reject)=>{
  //     let body = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
  //     <soapenv:Header/>
  //     <soapenv:Body>
  //        <tem:${actionName}>
  //           <tem:strParameter>
  //           ${data}
  //           </tem:strParameter>
  //        </tem:${actionName}>
  //     </soapenv:Body>
  //  </soapenv:Envelope>`
  
  //     this.api.Post(this.BASE_API_URL,body).then(data=>{
  //         let valueObj = this.getDomValue(data, actionName+'Result');
  //         if(valueObj['flag']) {
  //           let result = valueObj['value'];
  //           if(result) {
  //             console.log(actionName+' result:'+result);
  //             resolve(JSON.parse(result));
  //           }else {
  //             reject('接口异常请稍后再试');
  //           }
  //         }else {
  //           reject(valueObj['msg']);
  //         }
  //     }).catch(error=>{
  //       reject(error);
  //     });
  //   });
  // }

  private doSoapByActionName(actionName:string, body:URLSearchParams):Promise<Object> {
      console.log(actionName + ' params:'+ body.toString());
      return new Promise((resolve, reject)=>{
        let authHeader = new Headers();
        authHeader.append('Content-Type', 'application/x-www-form-urlencoded');

        this.api.post(this.getUrlByActionName(actionName), body, { headers: authHeader }).timeout(60000).map(result=> result.json()).subscribe((data) => {
          console.log(actionName + ' response:'+ JSON.stringify(data));
          if(data.success == true) {
            let valueObj = data.data;
                console.log(actionName+' result:'+JSON.stringify(valueObj));
                resolve(valueObj);
          }else {
            reject(data.data);
          }
        },
        (error) => {
          console.log('Http error:'+ JSON.stringify(error));
          reject(JSON.stringify(error));
        }
        );
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

export class UserInfoObj {
  userName:string = '';
  realname:string = '';
  postName:string = '';
  orgCode:string = '';
  orgName:string = '';
  roleName:string = '';
  departmentCode:string = '';
  departmentName:string = '';
}


