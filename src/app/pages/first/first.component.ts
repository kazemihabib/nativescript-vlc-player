﻿import 'reflect-metadata';
import {Component,OnInit} from "@angular/core";
import application = require("application");
import {View} from "ui/core/view";
import {Router} from "@angular/router";
import {chroma,HW,VLCSettings} from "nativescript-ng2-vlc-player/nativescript-ng2-vlc-player";


@Component({
    selector: "first",
    templateUrl: "pages/first/first.html",
})

export class firstPage{

   path:string = 'file:///sdcard/Download/si.mkv';
     constructor(private _router: Router) {
   }

   public play(){
      this._router.navigate(["/player",{path:this.path}]);
   }

   public ngOnInit(){

    console.log('hardwareAcceleration before set settings: ' +VLCSettings.hardwareAcceleration);
    console.log('netowrkCachingValue before set settings: ' + VLCSettings.networkCachingValue)
    
    VLCSettings.hardwareAcceleration = HW.HW_ACCELERATION_DISABLED;
    VLCSettings.networkCachingValue = 3000;


    console.log('hardwareAcceleration after set settings: ' + VLCSettings.hardwareAcceleration);
    console.log('networkCachingValue after set settings: ' + VLCSettings.networkCachingValue)
   }

    public loaded(){
      console.log('first.component loaded');
    }

    public unLoaded(){
      console.log('first.component unloaded');
    }

}
