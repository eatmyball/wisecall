import { Headers,Http, RequestOptions } from "@angular/http";
import "rxjs/add/operator/map";
import "rxjs/add/operator/toPromise";
import "rxjs/add/operator/timeout";
import { Injectable } from '@angular/core';

/*
  Generated class for the ApiProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class ApiProvider {

  constructor(public http:Http) {
    console.log('Hello ApiProvider Provider');
  }

  public Post(url: string, data: any) {
    let header = new Headers({
      "Content-Type": "text/xml; charset=utf-8",
    });

    let urlAddress = url;
    return this.httpRequest({
      type: "post", data: {
        url: urlAddress,
        data: data,
        header: new RequestOptions({headers: header})
      }
    })
  }
  public Get(url: string, data) {
    let header = new Headers({
      "Content-Type": "text/xml; charset=utf-8",
    });

    return this.httpRequest(
      {
        type: "get",
        data: {
          url: url,
          data: data,
          header: new RequestOptions({headers: header})
        }
      });
  }
  public DELETE(url: string, data) {
    let header = new Headers({
      "Content-Type": "text/xml; charset=utf-8",
    });
    return this.httpRequest(
      {
        type: "delete",
        data: {
          url: url,
          data: data,
          header: new RequestOptions({headers: header})
        }
      });
  }
  public PUT(url, data) {
    let header = new Headers({
      "Content-Type": "text/xml; charset=utf-8",
    });

    return this.httpRequest(
      {
        type: "put",
        data: {
          url: url,
          data: data,
          header: new RequestOptions({headers: header})
        }
      });
  }

  public uploadFile(url, ) {

  }

  private httpRequest({ type, data }) {

    return this.dataCode(type, data)
      .then(({ url, fomtData }) => {
        console.log(url, JSON.stringify(fomtData));
        let https;
        if (type == "get") {
          https = this.http.get(url, data.header);
        } else if (type == "post") {
          https = this.http.post(url, fomtData, data.header);
        } else if (type == "delete") {
          https = this.http.delete(url, data.header)
        } else if (type == "put") {
          https = this.http.put(url, fomtData, data.header)
        }
        return https.toPromise()
          .then(res => this.handleSuccess(res))
          .catch(err => this.handleError(err));
      })

  }

    /**
   * 请求成功
   * @param res 
   */
  handleSuccess(result) {
    console.log('Http Response:' + JSON.stringify(result));
    if (result.status !== 200) {
      return { success: false };
    }
    // result = result.json();
    return result;
  }

    /**
   * 请求失败
   * @param error 
   */
  handleError(error) {
    console.log('Http error:' + JSON.stringify(error,Object.getOwnPropertyNames(error)));
    return error.json();
  }

  private dataCode(type, reqData) {
    return new Promise((resolve) => {

      let url = reqData.url;
      let fomtData = reqData.data;
      // 如果是get请求,将数据拼在地址后面,清空data
      if (type === 'get' && fomtData) {
        fomtData = this.glueData(reqData.data);
        if (fomtData) {
          url = `${url}?${fomtData}`
        } else {
          url = `${url}`
        }

        fomtData = null;
      }
      resolve({ url, fomtData })
    })
  }

    // 拼接get请求数据
    private glueData(reqData) {

      let reqObj: any = [];
      for (let key in reqData) {
        var _str = key + "=" + encodeURIComponent(reqData[key]);
        reqObj.push(_str);
      }
      reqObj = reqObj.join("&");
      return reqObj;
    }

}
