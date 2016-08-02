import {Component,OnInit,ViewChild,ElementRef,AfterViewInit,Input} from "@angular/core";
import {View} from "ui/core/view";
import {VLCComponent} from "../vlc-plugin/vlc.component";

@Component({
    selector: "my-app",
    templateUrl: "./Demo/app.component.html",
    directives:[VLCComponent]
})

export class AppComponent implements AfterViewInit{

    @ViewChild("vlcElement") vlc: VLCComponent;
    vlcAction;
    VLC;
    eventCallback={
        eventHardwareAccelerationError:function(){
          console.log("eventHardwareAccelerationError");
        }
    }
    ngAfterViewInit(){
      this.vlcAction = this.vlc.getVLCAction();
    }

}
