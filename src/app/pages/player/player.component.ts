import 'reflect-metadata';
import {Component,OnInit} from "@angular/core";
import application = require("application");
import {VLCComponent} from "nativescript-ng2-vlc-player/nativescript-ng2-vlc-player";
import {ActivatedRoute} from "@angular/router";
import appSettings = require("application-settings");
import {registerElement} from "nativescript-angular/element-registry";
registerElement("DropDown", () => require("nativescript-drop-down/drop-down").DropDown);

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
    public currentAudioTrack = -1;
    public selectedIndex = 0;
    public items:Array<number>=[-1];
    public audioTracks = new Array<{id:number,name:string}>();
    public dd:any;

    eventHardwareAccelerationError = function(){
        console.log("event: eventHardwareAccelerationError");
    }
    eventPlaying = function(){
        console.log('event : Playing');
    }

    eventParsedChanged = function(){
     {
      this.audioTracks = this.vlc.getAudioTracks();
      let _current = this.vlc.audioTrack;
      this.items = [];
      this.audioTracks.forEach(
        (element,index,array)=>{
          this.items.push(element.id);
          if(element.id == _current)
            this.selectedIndex = index;
        }
      )
      this.dd.items = this.items;
      this.dd.selectedIndex = this.selectedIndex;
    }
  }

    dropDownLoaded(dd){
      this.dd = dd;
    }

    onLoaded(vlc){
      this.vlc = vlc;
      this.vlcAction = this.vlc.getVLCAction();
    }
    constructor(private route: ActivatedRoute){}

    ngOnDestroy() {
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
      console.log('currentVolume : ' + obj.currentVolume);
      console.log('maxVolume ' + obj.maxVolume);
    }

    public save(){
      appSettings.setNumber(this.path, this.position);
    }

    public changeAspectRatio(){
      let currentAspectRatio = this.vlc.getCurrentAspectRatioItem();
      console.log('currentAspectRatio' + currentAspectRatio.name);
      this.currentAspectRatio = (currentAspectRatio.value + 1) % 7;
    }


    public onchange(indx){
        this.currentAudioTrack = this.items[indx];
    }

}
