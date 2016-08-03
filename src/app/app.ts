import 'reflect-metadata';
import {Component,OnInit,ViewChild,ElementRef,AfterViewInit,Input} from "@angular/core";
import {View} from "ui/core/view";
import {VLCComponent} from "nativescript-ng2-vlc-player/nativescript-ng2-vlc-player";
import {nativeScriptBootstrap} from "nativescript-angular/application";

@Component({
    selector: "my-app",
    templateUrl: "./app.html",
    directives:[VLCComponent]
})

export class AppComponent implements AfterViewInit{

    @ViewChild("vlcElement") vlc: VLCComponent;
    vlcAction;
    path:string = '/sdcard/Download/si.mkv';
    eventCallback={
        eventHardwareAccelerationError:function(){
          console.log("eventHardwareAccelerationError");
        },
        eventPlaying:function(){
          console.log('in appComponent : Playing');
        }
    }
    ngAfterViewInit(){
      this.vlcAction = this.vlc.getVLCAction();
    }

    public up(){
      let obj = this.vlcAction.volumeUp();
      console.log('currentVolume :');
      console.log(obj.currentVolume);
      console.log('maxVolume');
      console.log(obj.maxVolume);

    }

}

nativeScriptBootstrap(AppComponent,[]);
