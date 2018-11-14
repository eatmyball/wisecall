import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  username:string = '';
  password:string = '';

  constructor(public navCtrl: NavController) {

  }

  onLoginClicked() {
    this.navCtrl.setRoot('TaskListPage');
  }

}
