# nativescript-vlc-player
nativescript vlc player plugin for NS-Angular2

## platforms:
  1-Android
  
## Install 
  ``` tns plugin add nativescript-ng2-vlc-player ```

## Sample Usage:
  https://github.com/kazemihabib/nativescript-vlc-player/tree/master/src/app
## Usage

    import {VLCComponent} from "nativescript-ng2-vlc-player/nativescript-ng2-vlc-player";
    @Component({
      selector: "player",
      template: `
                <Button text="play" (tap)="vlcAction.play()"></Button>
                <vlc #vlcElement [videoPath] = "path" (loaded)="onLoaded(vlcElement)"></vlc>
              `,
      directives:[VLCComponent]
    })

    export class playerPage implements OnInit{
      vlcAction;
      path="https://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4"

      onLoaded(vlc){
        this.vlcAction = vlc.getVLCAction();
      }
    }
    
## Documentation:
###  VLCComponent:
#### EVents:

    1-eventPlaying
    2-eventPausd
    3-eventStopped
    4-eventEndReached
    5-eventEncounteredError
    6-eventTimeChanged
    7-eventPositionChanged
    8-eventHardwareAccelerationError
    9-eventCompatibleCpuError
    10-eventNativeCrashError
    11-eventParsedChanged
    12-eventMetaChanged
#### example:
  Template:
    
    <vlc (eventPlaying) = "eventPlaying()" ></vlc>
    
  TS:
    

    eventPlaying = function(){
        console.log('event : Playing');
    }
  
#### methods:
    
    1-getVLCAction()
    2-stopPlayback()
    3-getCurrentAspectRatioItem():{value:number,name:string}
    4-getAudioTracks():{id:number,name:string}[]
    

#### Attributes:

    1- videoPath:string     [getter and setter]
    2- lastPosition: number [getter and setter]
    3- aspectRatio: number  [setter]
    4- audioTrack : number  [getter and setter]
    
#### Objects:
      
      vlcAction = {
        getLength: () : number =>{},
        getPosition : () :number =>{},
        isPlaying : ():boolean => {},
        play : ():void => {},
        stop : ():void => {},
        pause : () : void => {},
        seek:( position:number):void => {},
        volumeUp:(): {'currentVolume':number,'maxVolume':number} => {},
        volumeDown:(): {'currentVolume':number,'maxVolume':number} => {},
      };
vlcAction can be accessed with `getVLCAction` method;

#### example:

  Template:
  
      <Button text="play" (tap)="vlcAction.play()"></Button>
      <Button text="pause" (tap)="vlcAction.pause()"></Button>
      <vlc #vlcElement [videoPath] = "path" (loaded)="onLoaded(vlcElement)"  [lastPosition]="position" ></vlc>
    
    
  TS:
  
    vlc;
    vlcAction;
    path="https://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4"
    onLoaded(vlc){
      this.vlc = vlc;
      this.vlcAction = vlc.getVLCAction();
    }
    
    application.android.off(application.AndroidApplication.activityDestroyedEvent);
      application.android.on(application.AndroidApplication.activityDestroyedEvent,
        function (args: application.AndroidActivityEventData) {
          this.vlc.stopPlayback();
          appSettings.setNumber(this.path, this.vlc.lastPosition);
        },this);
    

### VLCSettings:
import {VLCSettings} from "nativescript-ng2-vlc-player/nativescript-ng2-vlc-player";

#### getters and setters:
     
      static hardwareAcceleration: HW;
      static timeStretchingAudio: boolean;
      static frameSkip: boolean;
      static chromaFormat: chroma;
      static verboseMode: boolean;
      static deblocking: deblocking;
      static networkCachingValue: number;
#### enums:
import {chroma,HW,deblocking} from "nativescript-ng2-vlc-player/nativescript-ng2-vlc-player";

    enum HW {
      HW_ACCELERATION_AUTOMATIC,
      HW_ACCELERATION_DISABLED,
      HW_ACCELERATION_DECODING,
      HW_ACCELERATION_FULL,
    }
    enum chroma {
      RGB32,
      RGB16,
      YUV,
    }
    enum deblocking {
      automatic,
      deblocking_always,
      deblocking_nonref,
      deblocking_nonkey,
      deblocking_all,
    }

#### example

    import {chroma,HW,VLCSettings} from "nativescript-ng2-vlc-player/nativescript-ng2-vlc-player";

    console.log('hardwareAcceleration before set settings: ' +VLCSettings.hardwareAcceleration);
    console.log('netowrkCachingValue before set settings: ' + VLCSettings.networkCachingValue)
    
    VLCSettings.hardwareAcceleration = HW.HW_ACCELERATION_DISABLED;
    VLCSettings.networkCachingValue = 3000;


    console.log('hardwareAcceleration after set settings: ' + VLCSettings.hardwareAcceleration);
    console.log('networkCachingValue after set settings: ' + VLCSettings.networkCachingValue)
    


## Just NativeScript without Angular:
  SOON ...

## License
  [MIT](https://opensource.org/licenses/MIT)
