import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TaskInfoPage } from './task-info';

@NgModule({
  declarations: [
    TaskInfoPage,
  ],
  imports: [
    IonicPageModule.forChild(TaskInfoPage),
  ],
})
export class TaskInfoPageModule {}
