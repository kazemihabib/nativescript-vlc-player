import {Component,OnInit,ViewChild,ElementRef,AfterViewInit,Input} from "@angular/core";
import {View} from "ui/core/view";

@Component({
    selector: "my-app",
    templateUrl: "app.component.html",
})

export class AppComponent implements OnInit{

    @ViewChild("vlc") vlc: ElementRef;

    VLC = (<View>this.vlc.nativeElement).android;
    vlcAction;
    eventCallback={
        eventHardwareAccelerationError:function(){
          console.log("eventHardwareAccelerationError");
        }
    }
    ngOnInit(){

      this.vlcAction = this.VLC.getVLCAction();


    }


}
