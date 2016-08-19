import 'reflect-metadata';
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

    console.log(VLCSettings.hardwareAcceleration);
    console.log(VLCSettings.networkCachingValue)
    
    VLCSettings.hardwareAcceleration = HW.HW_ACCELERATION_DISABLED;
    VLCSettings.networkCachingValue = 3000;


    console.log(VLCSettings.hardwareAcceleration);
    console.log(VLCSettings.networkCachingValue)
   }


}
