import {Component,OnInit,ViewChild,ElementRef,AfterViewInit,Input} from "@angular/core";
import {View} from "ui/core/view";
import {VLCComponent} from "../nativescript-vlc-plugin/vlc.component";

@Component({
    selector: "my-app",
    templateUrl: "./Demo/app.component.html",
    directives:[VLCComponent]
})

export class AppComponent implements AfterViewInit{

    @ViewChild("vlcElement") vlc: VLCComponent;
    vlcAction;
    path:string;
    eventCallback={
        eventHardwareAccelerationError:function(){
          console.log("eventHardwareAccelerationError");
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
