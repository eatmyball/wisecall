import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides } from 'ionic-angular';

/**
 * Generated class for the GallaryPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-gallary',
  templateUrl: 'gallary.html',
})
export class GallaryPage {

  @ViewChild('albumslides') albums:Slides;
  imageList = [];
  index:number;
  languageObj:Object = {};

  constructor(public navCtrl: NavController, 
    public navParams: NavParams
  ) {
    
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AlbumpagePage');
    this.imageList = this.navParams.get('imgs');
  }

  ionViewDidEnter(){
    
  }

  presentImage(url) {
    window.open(url);
  }

}
