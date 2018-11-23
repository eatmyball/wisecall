import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GallaryPage } from './gallary';

@NgModule({
  declarations: [
    GallaryPage,
  ],
  imports: [
    IonicPageModule.forChild(GallaryPage),
  ],
})
export class GallaryPageModule {}
