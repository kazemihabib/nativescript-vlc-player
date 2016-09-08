/*
  TODO:
  2-add PlayerControl
  3-subtitleSurfaceView

  ISSUES:
    1-AspectRatio becomes Original Surface when navigation
*/


import {Component,OnInit,ViewChild,ElementRef,AfterViewInit,Input,Output,EventEmitter} from "@angular/core";
import {View} from "ui/core/view";
import placeholder = require("ui/placeholder");
let application= require("application");
let platform = require("platform");


declare var org:any;
declare var java:any;
declare var android:any;
declare var Candroid:any;

type SurfaceHolder = any;
type SurfaceView = any;
type LibVLC = any;       //org.videolan.libvlc.LibVLC
type MediaPlayer  = any; //org.videolan.libvlc.MediaPlayer;
type ArrayList = any;
type IVLCVout = any;    //org.videolan.libvlc.IVLCVout;
type Media = any;       //org.videolan.libvlc.Media;
type Intent = any;
type LayoutParams = any;
type AudioManager = any; //android.media.AudioManager;

@Component({
    selector: "vlc",
    template:
    `
        <StackLayout>
            <Placeholder #surface *ngIf="init" (creatingView)="createVLCSurface($event)" (loaded)="onLoaded(surface)" ></Placeholder>
        </StackLayout>
    `
})
export class VLCComponent implements OnInit{

    // imports
    private activity:any = application.android.foregroundActivity;
    private context = android.content.Context;

    private  LibVLC : LibVLC = org.videolan.libvlc.LibVLC;

    private MediaPlayer =  org.videolan.libvlc.MediaPlayer;

    private Media = org.videolan.libvlc.Media;

    private IVLCVout = org.videolan.libvlc.IVLCVout;

    private VLCUtil =  org.videolan.libvlc.util.VLCUtil;

    //end of imports

    //placeholder
    public init: boolean = false;

    private playerSurfaceView:any;

    private mediaPlayer: MediaPlayer;

    private mPlaybackStarted:boolean = false;


    private mVideoHeight:number;
    private mVideoWidth:number;
    private mVideoVisibleHeight:number;
    private mVideoVisibleWidth:number;
    private mSarNum:number;
    private mSarDen:number;


    //AspectRatio
    private  SURFACE_BEST_FIT:number = 0;
    private  SURFACE_FIT_HORIZONTAL :number= 1;
    private  SURFACE_FIT_VERTICAL :number= 2;
    private  SURFACE_FILL : number= 3;
    private  SURFACE_16_9 : number= 4;
    private  SURFACE_4_3 : number= 5;
    private  SURFACE_ORIGINAL :number = 6;

    private _currentAspectRatioItem : {value:number,name:string} = null;

    private libVLC : any;
    private audioManager : AudioManager;
    private AudioManager : AudioManager =  android.media.AudioManager;
    private maxVolume : number;
    private aspectRatioItems : [{value : number, name : string}] =
    [
      {
        value: this.SURFACE_BEST_FIT,
        name:"best fit"
      },
      {
          value: this.SURFACE_FIT_HORIZONTAL,
          name:"fit horizontal"
      },
      {
         value:this.SURFACE_FIT_VERTICAL,
         name:"fit vertical"
      },
      {
          value:this.SURFACE_FILL,
          name:"fill"
      },
      {
        value:this.SURFACE_16_9,
        name:"16:9"
      },
     {
        value:this.SURFACE_4_3,
        name:"4:3"
     },
     {
        value:this.SURFACE_ORIGINAL,
        name:"original"
     }
    ]


    _videoPath:string="";
    mHasAudioFocus : boolean = false;
    private _lastPosition:number = 0;
    private _audioTracks = new Array<{id:number,name:string}>();

    public getCurrentAspectRatioItem():{value:number,name:string} {return this._currentAspectRatioItem};
    public getAudioTracks():{id:number,name:string}[]{
      return this._audioTracks;
    };
    //@Inputs

    @Input()
    set videoPath(videoPath:string){
        this._videoPath = videoPath.trim();
    }

    get videoPath():string{
       return this._videoPath; 
    }
    @Input()
    set lastPosition(lastPosition: number) {
      this._lastPosition = lastPosition;
    }

    get lastPosition():number{return this._lastPosition};

    @Input()
    set aspectRatio(aspectRatio:number){
        this._currentAspectRatioItem = this.aspectRatioItems[aspectRatio% 7];
        if(this.mPlaybackStarted)
          this.changeSurfaceLayout();
    }

    @Input()
    set audioTrack(audioTrack:number){
        if(this.mediaPlayer)
          this.mediaPlayer.setAudioTrack(audioTrack);
    }

    get audioTrack():number{
      if(this.mediaPlayer)
        return  this.mediaPlayer.getAudioTrack();
    }


    //@Outputs


    @Output() eventHardwareAccelerationError = new EventEmitter();
    @Output() eventPlaying = new EventEmitter();
    @Output() eventPausd = new EventEmitter();
    @Output() eventStopped = new EventEmitter();
    @Output() eventEndReached = new EventEmitter();
    @Output() eventEncounteredError = new EventEmitter();
    @Output() eventTimeChanged = new EventEmitter();
    @Output() eventPositionChanged = new EventEmitter();
    @Output() eventCompatibleCpuError = new EventEmitter();
    @Output() eventNativeCrashError = new EventEmitter();
    @Output() eventParsedChanged = new EventEmitter();
    @Output() eventMetaChanged = new EventEmitter(); 

    //////////////////////////////////////////


    public getVLCAction(){
      return this.vlcAction;
    }

    onLoaded(surface){
      this.playerSurfaceView = surface.android;
    }


    private startPlayback():void {
        if (this.mPlaybackStarted) {
            return;
        }

        // we should create new MediaPlayer after each MediaPlayer.release
        this.mediaPlayer = new this.MediaPlayer(this.libVLC);
        let vlcVout:IVLCVout = this.mediaPlayer.getVLCVout();

        vlcVout.setVideoView(this.playerSurfaceView);

        //******************************
        //TODO:

        // if (subtitlesSurfaceView != null && subtitlesSurfaceView.getVisibility() == View.VISIBLE) {
        //     vlcVout.setSubtitlesView(subtitlesSurfaceView);
        // }

        //*****************************************

        vlcVout.addCallback(this.IVLCVout_callback);
        vlcVout.attachViews();

        this.mPlaybackStarted = true;
        let __this = this;

        this.playerSurfaceView.addOnLayoutChangeListener(this.playerLayoutChangeListener);
        this.changeSurfaceLayout();

        this.mediaPlayer.setEventListener(this.mediaPlayerEventListener);

        const media:Media  = new this.Media(this.libVLC, android.net.Uri.parse(this.videoPath));

        //third argument (flags) is 0 because vlc for android did this. 
        org.videolan.vlc.util.VLCOptions.setMediaOptions(media ,application.android.currentContext , 0);


        media.setEventListener(this.mediaEventListener);

        this.mediaPlayer.setMedia(media);
        media.release();

        //**********************************
        // check what this function do and handle it
        // this.mediaPlayer.setVideoTitleDisplay(this.MediaPlayer.Position.Disable, 0);
        //**********************************

        this.mediaPlayer.play();
    }

    private playerLayoutChangeListener = (() => {
        let __this = this;
        return new android.view.View.OnLayoutChangeListener( {
          onLayoutChange : function ( v:View, left:number, top:number, right:number, bottom:number, oldLeft:number, oldTop:number, oldRight:number, oldBottom:number):any {
              if (left != oldLeft || top != oldTop || right != oldRight || bottom != oldBottom) {
                  __this.changeSurfaceLayout();
              }
          }
        });
      })();

    public stopPlayback():void {
      if (!this.mPlaybackStarted) {
          return;
      }
      this.mPlaybackStarted = false;

      this.lastPosition = this.vlcAction.getPosition();


      this.changeAudioFocus(false);

      this.playerSurfaceView.removeOnLayoutChangeListener(this.playerLayoutChangeListener);
      let vlcVout:IVLCVout = this.mediaPlayer.getVLCVout();

      vlcVout.removeCallback(this.IVLCVout_callback);
      if(vlcVout.areViewsAttached()){
          vlcVout.detachViews();
      }

      let media = this.mediaPlayer.getMedia();
      if (media != null) {
          media.setEventListener(null);
          this.mediaPlayer.setEventListener(null);
          this.mediaPlayer.stop();
          this.mediaPlayer.setMedia(null);
          media.release();
      }
      this.mediaPlayer.release();
      this.mediaPlayer = null;

      this._audioTracks = [];
}

  private  mediaEventListener = (():any => {
     let __this = this;
     return new this.Media.EventListener({
        onEvent : function(event){
            switch (event.type) {
                case __this.Media.Event.ParsedChanged:
                    __this.mediaPlayer.setTime(__this.lastPosition);
                    //**************************
                    //TODO:

                    //this changes the seekbar length
                    // updateMediaLength((int) mediaPlayer.getLength());
                    // mediaPlayer.setSpuTrack(-1);
                    __this.initAudioTracks();

                    __this.eventParsedChanged.emit('');
                    //*************************************
                    break;
                case __this.Media.Event.MetaChanged:
                    __this.eventMetaChanged.emit('');
                    break;
                default:
                    break;
            }
        }
  });
})();

    private changeAudioFocus( acquire:boolean):void {
        if (this.audioManager == null) {
            return;
        }
        if (acquire) {
            if (!this.mHasAudioFocus) {
                const result:number = this.audioManager.requestAudioFocus(this.mAudioFocusListener, this.AudioManager.STREAM_MUSIC, this.AudioManager.AUDIOFOCUS_GAIN);
                if (result == this.AudioManager.AUDIOFOCUS_REQUEST_GRANTED) {
                    this.audioManager.setParameters("bgm_state=true");
                    this.mHasAudioFocus = true;
                }
            }
        } else {

            if (this.mHasAudioFocus) {

                this.audioManager.abandonAudioFocus(this.mAudioFocusListener);
                this.audioManager.setParameters("bgm_state=false");
                this.mHasAudioFocus = false;
            }
        }
    }


    private mAudioFocusListener = (() => {
      let __this = this;
      return new this.AudioManager.OnAudioFocusChangeListener( {

      mLossTransient : false,
      mLossTransientCanDuck :  false,

      //Java @override
      onAudioFocusChange  : function( focusChange:number) : void {
          switch (focusChange) {
              case __this.AudioManager.AUDIOFOCUS_LOSS:
                  __this.changeAudioFocus(false);
                   const media : Media = __this.mediaPlayer.getMedia();
                  if (media != null) {
                      media.setEventListener(null);
                      __this.mediaPlayer.setEventListener(null);
                      __this.mediaPlayer.stop();
                      __this.mediaPlayer.setMedia(null);
                       media.release();
                  }
                  break;
              case __this.AudioManager.AUDIOFOCUS_LOSS_TRANSIENT:
                  if (__this.mediaPlayer.isPlaying()) {
                      this.mLossTransient = true;
                      this.mediaPlayer.pause();
                  }
                  break;
              case __this.AudioManager.AUDIOFOCUS_LOSS_TRANSIENT_CAN_DUCK:
                  if (__this.mediaPlayer.isPlaying()) {
                      __this.mediaPlayer.setVolume(36);
                      this.mLossTransientCanDuck = true;
                  }
                  break;
              case __this.AudioManager.AUDIOFOCUS_GAIN:
                  if (this.mLossTransientCanDuck) {
                      __this.mediaPlayer.setVolume(100);
                      this.mLossTransientCanDuck = false;
                  }
                  if (this.mLossTransient) {
                      __this.mediaPlayer.play();
                      this.mLossTransient = false;
                  }
                  break;
              default:
                  break;
          }
      }
  })})();




    private IVLCVout_callback = (()=>{
      let __this = this;
      return new this.IVLCVout.Callback({
        onNewLayout:function( vlcVout:IVLCVout, width:number, height:number, visibleWidth:number, visibleHeight:number, sarNum:number, sarDen:number){
           if (width * height == 0) {
              return;
           }
            // store video size
          __this.mVideoWidth = width;
          __this.mVideoHeight = height;
          __this.mVideoVisibleWidth = visibleWidth;
          __this.mVideoVisibleHeight = visibleHeight;
          __this.mSarNum = sarNum;
          __this.mSarDen = sarDen;
          __this.changeSurfaceLayout();
        },
        onSurfacesCreated:function(vlcVout:IVLCVout){},
        onSurfacesDestroyed:function(vlcVout:IVLCVout){},
        onHardwareAccelerationError:function( vlcVout:IVLCVout){
           __this.eventHardwareAccelerationError.emit('');
        }
      })
    })();

    private mediaPlayerEventListener = (() => {
      let __this = this;

      return new this.MediaPlayer.EventListener({

        onEvent(event:any):void {
            switch (event.type) {
                case __this.MediaPlayer.Event.Playing:
                    __this.eventPlaying.emit('');

                    __this.changeAudioFocus(true);

                    break;
                case __this.MediaPlayer.Event.Paused:
                    __this.eventPausd.emit('');
                    break;
                case __this.MediaPlayer.Event.Stopped:
                    __this.eventStopped.emit('');

                    __this.changeAudioFocus(false);
                    break;
                case __this.MediaPlayer.Event.EndReached:
                    __this.eventEndReached.emit('');

                    __this.changeAudioFocus(false);
                    // TODO: video ended
                    // finish();
                    break;
                case __this.MediaPlayer.Event.EncounteredError:
                    __this.eventEncounteredError.emit('');
                    break;
                case __this.MediaPlayer.Event.TimeChanged:
                    __this.eventTimeChanged.emit('');
                    //****************************************
                    //TODO:
                    // updateSubtitles(vlcAction.getPosition());
                    //***************************************
                    break;
                case __this.MediaPlayer.Event.PositionChanged:
                      __this.eventPositionChanged.emit('');
                    break;
                case __this.MediaPlayer.Event.Vout:
                    break;
                case __this.MediaPlayer.Event.ESAdded:
                    break;
                case __this.MediaPlayer.Event.ESDeleted:
                    break;
                default:
                    break;
            }
        }
    })
  })();


    ngOnInit(){
      this.init = true;
      if (!this.VLCUtil.hasCompatibleCPU(this.activity.getBaseContext())) {
          this.eventCompatibleCpuError.emit('');
          return;
      }

     this.LibVLC.setOnNativeCrashListener(new this.LibVLC.OnNativeCrashListener({
          onNativeCrash :() =>{
          //parameter is because of error:Supplied parameters do not match any signature of call target
          this.eventNativeCrashError.emit('');
          }
      }))

    this.libVLC = new this.LibVLC(org.videolan.vlc.util.VLCOptions.getLibOptions(application.android.currentContext));

    this.audioManager =  this.activity.getSystemService(this.context.AUDIO_SERVICE);
    this.maxVolume = this.audioManager.getStreamMaxVolume(this.AudioManager.STREAM_MUSIC);
    this.activity.setVolumeControlStream(this.AudioManager.STREAM_MUSIC);

    this.aspectRatio = 0;
    }

    // create SurfaceView
    public createVLCSurface(args: placeholder.CreateViewEventData) {
      var nativeView = new android.view.SurfaceView(application.android.currentContext);
      args.view = nativeView;
    }

    // Listener for surfaceView


    private changeSurfaceLayout():void {
        let sw:number = this.activity.getWindow().getDecorView().getWidth();
        let sh:number = this.activity.getWindow().getDecorView().getHeight();


        if (this.mediaPlayer != null) {
            this.mediaPlayer.getVLCVout().setWindowSize(sw, sh);
        }

        let dw : number = sw;
        let dh : number = sh;

        let isPortrait:boolean = this.activity.getResources().getConfiguration().orientation == android.content.res.Configuration.ORIENTATION_PORTRAIT;
        if (sw > sh && this.activity.isPortrait || sw < sh && !isPortrait) {
            dw = sh;
            dh = sw;
        }

        // sanity check
        if (dw * dh == 0 || this.mVideoWidth * this.mVideoHeight == 0) {
            return;
        }

        // compute the aspect ratio
        let ar:number, vw:number;
        if (this.mSarDen == this.mSarNum) {
            /* No indication about the density, assuming 1:1 */
            vw = this.mVideoVisibleWidth;
            ar = this.mVideoVisibleWidth / this.mVideoVisibleHeight;
        } else {
            /* Use the specified aspect ratio */
            vw = this.mVideoVisibleWidth * this.mSarNum / this.mSarDen;
            ar = vw / this.mVideoVisibleHeight;
        }

        // compute the display aspect ratio
        let dar:number = dw / dh;

        switch (this.getCurrentAspectRatioItem() != null ? this.getCurrentAspectRatioItem().value : this.SURFACE_BEST_FIT) {
            case this.SURFACE_BEST_FIT:
                if (dar < ar)
                    dh = dw / ar;
                else
                    dw = dh * ar;
                break;
            case this.SURFACE_FIT_HORIZONTAL:
                dh = dw / ar;
                break;
            case this.SURFACE_FIT_VERTICAL:
                dw = dh * ar;
                break;
            case this.SURFACE_FILL:
                break;
            case this.SURFACE_16_9:
                ar = 16.0 / 9.0;
                if (dar < ar)
                    dh = dw / ar;
                else
                    dw = dh * ar;
                break;
            case this.SURFACE_4_3:
                ar = 4.0 / 3.0;
                if (dar < ar)
                    dh = dw / ar;
                else
                    dw = dh * ar;
                break;
            case this.SURFACE_ORIGINAL:
                dh = this.mVideoVisibleHeight;
                dw = vw;
                break;
        }

        // set display size
        let lp:any = this.playerSurfaceView.getLayoutParams();
        lp.width = Math.ceil(dw * this.mVideoWidth / this.mVideoVisibleWidth);
        lp.height = Math.ceil(dh * this.mVideoHeight / this.mVideoVisibleHeight);
        this.playerSurfaceView.setLayoutParams(lp);
        //****************************
        //TODO:
        // subtitlesView.setLayoutParams(lp);
        // if (subtitlesSurfaceView != null) {
            // subtitlesSurfaceView.setLayoutParams(lp);
        // }
        //**********************************

        this.playerSurfaceView.invalidate();
        //************************************
        //TODO:
        // subtitlesView.invalidate();
        // if (subtitlesSurfaceView != null) {
        //     subtitlesSurfaceView.invalidate();
        // }
        //*************************************
    }





  private  vlcAction = {
      getLength: () : number => {
          return this.mediaPlayer != null ? this.mediaPlayer.getLength() : 0;
      },

      getPosition : () :number => {
          return this.mediaPlayer != null ? this.mediaPlayer.getTime() : 0;
      },

      isPlaying : ():boolean => {
          return this.mediaPlayer != null && this.mediaPlayer.isPlaying();
      },

      play : ():void => {
          if(this.mediaPlayer != null)
            this.mediaPlayer.play();
          else
            this.startPlayback();
      },

      stop : ():void =>{
        this.mediaPlayer.stop();
      },

      pause : () : void => {
          if (this.mediaPlayer != null) {
              this.mediaPlayer.pause();
          }
      },

      seek:( position:number):void => {
          if (this.mediaPlayer != null) {
              let length : number = this.mediaPlayer.getLength();
              if (length == 0) {
                  this.mediaPlayer.setTime(position);
              } else {
                  this.mediaPlayer.setPosition(position / length);
              }
          }
      },

      volumeUp:(): {'currentVolume':number,'maxVolume':number} => {
          let __this = this;
          if (this.audioManager != null) {
              let currentVolume : number = this.audioManager.getStreamVolume(this.AudioManager.STREAM_MUSIC);
              currentVolume = Math.min(currentVolume + 1, this.maxVolume);
              this.audioManager.setStreamVolume(this.AudioManager.STREAM_MUSIC, currentVolume, 0);
              return {
                'currentVolume':currentVolume,
                'maxVolume':__this.maxVolume
              }
          }
      },

      volumeDown:(): {'currentVolume':number,'maxVolume':number} => {
          let __this = this;
          if (this.audioManager != null) {
              let currentVolume = this.audioManager.getStreamVolume(this.AudioManager.STREAM_MUSIC);
              currentVolume = Math.max(currentVolume - 1, 0);
              this.audioManager.setStreamVolume(this.AudioManager.STREAM_MUSIC, currentVolume, 0);
              return {
                'currentVolume':currentVolume,
                'maxVolume':__this.maxVolume
              }
          }
      },
      setVolume:(value:number): {'currentVolume':number,'maxVolume':number} =>{
          let __this = this;
          if (this.audioManager != null) {
              let newVolume = Math.min(value, this.maxVolume);
              newVolume = Math.max(newVolume, 0);
              this.audioManager.setStreamVolume(this.AudioManager.STREAM_MUSIC, newVolume, 0);
              return {
                'currentVolume': newVolume,
                'maxVolume':__this.maxVolume
              }
          }
      },
      getVolume:(): {'currentVolume':number,'maxVolume':number} => { 
          let __this = this;

          if (this.audioManager != null) {
              let currentVolume = this.audioManager.getStreamVolume(this.AudioManager.STREAM_MUSIC);
              return {
                'currentVolume':currentVolume,
                'maxVolume':__this.maxVolume
              }
          }
      }

    

};

private initAudioTracks(){
  let audioTracks = this.mediaPlayer.getAudioTracks();
  for(let item of audioTracks)
    this._audioTracks.push({id:item.id,name:item.name});
 }
}
