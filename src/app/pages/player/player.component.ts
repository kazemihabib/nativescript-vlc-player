import 'reflect-metadata';
import {Component,OnInit} from "@angular/core";
import application = require("application");
import {VLCComponent} from "nativescript-ng2-vlc-player/nativescript-ng2-vlc-player";
import {ActivatedRoute} from "@angular/router";
import appSettings = require("application-settings");
@Component({
    selector: "player",
    templateUrl: "pages/player/player.html",
    directives:[VLCComponent]
})

export class playerPage implements OnInit{

    // public init = false;
    vlc;
    vlcAction;
    private sub:any;
    public path:string;
    public position:number = 0;
    public currentAspectRatio = 0;
    eventCallback = {
        eventHardwareAccelerationError:function(){
          console.log("eventHardwareAccelerationError");
        },
        eventPlaying:function(){
          console.log('in appComponent : Playing');
        }
    }

    onLoaded(vlc){
      console.log('onLoaded is called');
      this.vlc = vlc;
      this.vlcAction = this.vlc.getVLCAction();
    }
    constructor(private route: ActivatedRoute){}

    ngOnDestroy() {
      console.log('onDestroy is called');
      this.sub.unsubscribe();
    }
    ngOnInit(){

     this.sub = this.route.params.subscribe(params => {
       let id = +params['id'];
       this.path = params['path'];
     });

     this.position = appSettings.getNumber(this.path,0);

      application.android.off(application.AndroidApplication.activityPausedEvent)
      application.android.on(application.AndroidApplication.activityPausedEvent,
        function (args: application.AndroidActivityEventData) {
          this.vlc.stopPlayback();
          this.position = this.vlc.lastPosition;
          this.save();
      },this);

      application.android.off(application.AndroidApplication.activityDestroyedEvent);
      application.android.on(application.AndroidApplication.activityDestroyedEvent,
        function (args: application.AndroidActivityEventData) {
          this.vlc.stopPlayback();
          this.position = this.vlc.lastPosition;
          this.save();
        },this);

      application.android.off(application.AndroidApplication.activityBackPressedEvent);
      application.android.on(application.AndroidApplication.activityBackPressedEvent,
        function (args) {
          this.vlc.stopPlayback();
          this.position = this.vlc.lastPosition;
          this.save();
      },this);
    }


    public up(){
      let obj = this.vlcAction.volumeUp();
      console.log('currentVolume :');
      console.log(obj.currentVolume);
      console.log('maxVolume');
      console.log(obj.maxVolume);

    }

    public save(){
      appSettings.setNumber(this.path, this.position);
    }

    public changeAspectRatio(){
      let currentAspectRatio = this.vlc.getCurrentAspectRatioItem();
      console.log(currentAspectRatio.name);
      this.currentAspectRatio = (currentAspectRatio.value + 1) % 7;
    }

}
