import 'reflect-metadata';
import {Component} from "@angular/core";
import application = require("application");
import {View} from "ui/core/view";
import {Router} from "@angular/router";

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

}
