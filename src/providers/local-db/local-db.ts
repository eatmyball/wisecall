import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

/*
  Generated class for the LocalDbProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class LocalDbProvider {

  constructor(private storage: Storage) {
    console.log('Hello LocalDbProvider Provider');
  }

    /**
     * 保存一个任意的对象
     * @param key 
     * @param value 
     */
    save(key: string, value: any):Promise<any> {
      return this.storage.set(key, value);
   }

   /**
    * 判断是否已经有该Key
    * @param key 
    */
   hasKey(key: string): Promise<any> {
       let promise = new Promise((resolve, reject) => {
           this.storage.keys().then(keys => {

               keys.forEach((value, index, array) => {
                   if (key == value) {
                       resolve(true);
                   }
               });
               reject('This key@' + key + ' is not exist!');
           });
       });
       return promise;
   }

   /**
    * 获取一个任意的对象
    * @param key 
    */
   getValue(key: string): Promise<any> {

       let promise = new Promise((resolve, reject) => {

           this.hasKey(key).then(value => {
               if (value == true) {
                   this.storage.get(key).then(value => {
                       resolve(value);
                   });
               }
           }, error => {
               reject(error);
           });
       });

       return promise;
   }

   /**
    * 存入单条数据，但是按数组形式存储
    * @param key 
    * @param data 
    */
   saveItem(key: string, data: any): Promise<any> {
       let promise = new Promise((resolve, reject) => {

           this.hasKey(key).then(value => {
               // Key存在时，添加到队列末尾
               if (value == true) {
                   this.storage.get(key).then(value => {
                       let array = Array.from(value);
                       let lastNum = array.length;
                       array.push(data)
                       let nowNum = array.length;
                       this.storage.set(key, array).then((data) => {
                           resolve(data);
                           console.log('save item:' + JSON.stringify(data) + 'saved before num:' + lastNum + ' after num:' + nowNum);
                       }).catch((error) => {
                           reject(error);
                       });
                   });
               }
           }, error => {
            console.log(JSON.stringify(error));
               let array = [];
               array.push(data);
               this.storage.set(key, array).then((data)=>{
                   resolve(data);
               }).catch(error =>{
                   reject(error);
               });
           });
       });
       return promise;
   }

   /**
    * 删除数组中的单条数据
    * @param key 
    * @param data 
    */
   removeItem(key: string, index: number): Promise<any> {
       let promise = new Promise((resolve, reject) => {

           this.hasKey(key).then(value => {
               // Key存在时，添加到队列末尾
               if (value == true) {
                   this.storage.get(key).then(value => {
                       try {
                           let array = [];
                           for(let i in value) {
                               if(Number(i) != index) {
                                   array.push(value[i]);
                               }
                           }
                           this.storage.set(key, array).then((data) => {
                               console.log('save item:' + JSON.stringify(data));
                               resolve(data);
                           }).catch((error) => {
                               reject(error);
                           });

                       } catch (error) {
                           reject(error)
                       }
                   });
               }
           }, error => {
               reject(error);
           });
       });
       return promise;
   }

   /**
    * 获取Array结果
    * @param key 
    */
   getArray(key: string): Promise<any> {
       let promise = new Promise((resolve, reject) => {
           this.hasKey(key).then(value => {
               // Key存在时，添加到队列末尾
               if (value == true) {
                   this.storage.get(key).then(value => {
                       resolve(value);
                   });
               }
           }, error => {
               reject(error);
           });
       });
       return promise;
   }

   /**
    * 清除某个Key的所有数据
    * @param key 
    */
   clear(key: string): Promise<any> {
       let promise = new Promise((resolve, reject) => {
           this.hasKey(key).then(value => {
               // Key存在时，添加到队列末尾
               if (value == true) {
                   this.storage.remove(key).then(() => {
                       resolve(true);
                   }).catch((error) => {
                       reject(error);
                   });
               }
           }, error => {
               reject(error);
           });
       });
       return promise;
   }


}
