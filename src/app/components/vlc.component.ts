/*
  TODO:
  2-add PlayerControl
  3-subtitleSurfaceView

  ISSUES:
    1-AspectRatio becomes Original Surface when navigation
*/
import {Component,OnInit,ViewChild,ElementRef,AfterViewInit,Input} from "@angular/core";
import {View} from "ui/core/view";
import placeholder = require("ui/placeholder");
let application= require("application");
let platform = require("platform");


export interface IEventCallback{
  eventHardwareAccelerationError?:Function;
  eventPlaying?:Function;
  eventPausd?:Function;
  eventStopped?:Function;
  eventEndReached?:Function;
  eventEncounteredError?:Function;
  eventTimeChanged?:Function;
  eventPositionChanged?:Function;
  eventCompatibleCpuError?:Function;
  eventParsedChanged?:Function;
  eventMetaChanged?:Function;
}

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
    templateUrl: "./components/vlc.component.html",
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


    mHasAudioFocus : boolean = false;
    private _lastPosition:number = 0;
    private _audioTracks = new Array<{id:number,name:string}>();

    get lastPosition():number{return this._lastPosition};
    public getCurrentAspectRatioItem():{value:number,name:string} {return this._currentAspectRatioItem};
    public getAudioTracks():{id:number,name:string}[]{
      return this._audioTracks;
    };
    //@Inputs

    @Input()
    public eventCallback:IEventCallback;
    @Input()
    public videoPath:string;
    @Input()
    set lastPosition(lastPosition: number) {
      this._lastPosition = lastPosition;
    }

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

    //////////////////////////////////////////


    public getVLCAction(){
      return this.vlcAction;
    }

    onLoaded(surface){
      this.playerSurfaceView = surface.android;
    }


    private startPlayback():void {
        console.log('startPlayback is called');
        if (this.mPlaybackStarted) {
            return;
        }

        // we should create new MediaPlayer after each MediaPlayer.release
        // console.log('startPlayback '+ 'mmediaplayer: ' + this.MediaPlayer);
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
        //*******************************
        //commented because of
        // ERROR : abstract method not implemented

        this.mediaPlayer.setEventListener(this.mediaPlayerEventListener);
        // console.log("mediaPlayerEventListener: ");
        // console.log(this.mediaPlayerEventListener().onEvent);
        //************************************

        const media:Media  = new this.Media(this.libVLC, android.net.Uri.parse(this.videoPath));
        //************************************
        //TODO: get SW or HW from user
        org.videolan.vlc.util.VLCOptions.setMediaOptions(media, 0, org.videolan.vlc.util.VLCOptions.HW_ACCELERATION_AUTOMATIC);
        //****************************************

        //*********************************
        // commented because of
        // ERROR : abstract method not implemented

        media.setEventListener(this.mediaEventListener);

        //*********************************************
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
                  console.log("OnLayoutChangeListener");
                  __this.changeSurfaceLayout();
              }
          }
        });
      })();

    public stopPlayback():void {
      console.log('stopPlayback is called');
      if (!this.mPlaybackStarted) {
          return;
      }
      this.mPlaybackStarted = false;

      this.lastPosition = this.vlcAction.getPosition();


      // this.mediaPlayer.stop();
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
                    console.log("nativescriptVLCPlugin: Media event - ParsedChanged");
                    __this.mediaPlayer.setTime(__this.lastPosition);
                    //**************************
                    //TODO:

                    //this changes the seekbar length
                    // updateMediaLength((int) mediaPlayer.getLength());
                    // mediaPlayer.setSpuTrack(-1);
                    __this.initAudioTracks();

                    if(__this.eventCallback.eventParsedChanged)
                      __this.eventCallback.eventParsedChanged();
                    //*************************************
                    break;
                case __this.Media.Event.MetaChanged:
                    console.log('MetaChanged');
                    if(__this.eventCallback.eventMetaChanged)
                      __this.eventCallback.eventMetaChanged();
                    break;
                default:
                    break;
            }
        }
  });
})();

    private changeAudioFocus( acquire:boolean):void {
        if (this.audioManager == null) {
            console.log('changeAudioFocus '+ 'shuld return');
            return;
        }
        if (acquire) {
            console.log('changeAudioFocus '+ 'acquire == true');
            if (!this.mHasAudioFocus) {
                console.log('changeAudioFocus '+ 'mHasAudioFocus  == false');
                const result:number = this.audioManager.requestAudioFocus(this.mAudioFocusListener, this.AudioManager.STREAM_MUSIC, this.AudioManager.AUDIOFOCUS_GAIN);
                if (result == this.AudioManager.AUDIOFOCUS_REQUEST_GRANTED) {
                    this.audioManager.setParameters("bgm_state=true");
                    this.mHasAudioFocus = true;
                }
            }
        } else {

            console.log('changeAudioFocus '+ 'acquire == false');
            if (this.mHasAudioFocus) {

                console.log('changeAudioFocus '+ 'mHasAudioFocus == true');
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
          // console.log("onNew Layout");
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
          if(__this.eventCallback.eventHardwareAccelerationError)
            __this.eventCallback.eventHardwareAccelerationError();
        }
      })
    })();

    private mediaPlayerEventListener = (() => {
      let __this = this;

      return new this.MediaPlayer.EventListener({

        onEvent(event:any):void {
            switch (event.type) {
                case __this.MediaPlayer.Event.Playing:
                    console.log("nativescriptVLCPlugin: MediaPlayer event - Playing");
                    if(__this.eventCallback.eventPlaying)
                      __this.eventCallback.eventPlaying();

                    __this.changeAudioFocus(true);

                    // if (vlcAction == getPlayerControl()) {
                        // eventMediaPlaying();
                    // } else {
                        // vlcAction.pause();
                    // }
                    break;
                case __this.MediaPlayer.Event.Paused:
                    console.log("nativescriptVLCPlugin: MediaPlayer event - Paused");
                    if(__this.eventCallback.eventPausd)
                      __this.eventCallback.eventPausd();
                    // if (vlcAction == getPlayerControl()) {
                        // eventMediaPaused();
                    // }
                    break;
                case __this.MediaPlayer.Event.Stopped:
                    console.log("nativescriptVLCPlugin: MediaPlayer event - Stopped");
                    if(__this.eventCallback.eventStopped)
                      __this.eventCallback.eventStopped();

                    __this.changeAudioFocus(false);
                    break;
                case __this.MediaPlayer.Event.EndReached:
                  console.log("nativescriptVLCPlugin: MediaPlayer event - EndReached");
                  if(__this.eventCallback.eventEndReached)
                    __this.eventCallback.eventEndReached();

                    __this.changeAudioFocus(false);
                    // TODO: video ended
                    // finish();
                    break;
                case __this.MediaPlayer.Event.EncounteredError:
                    console.log("nativescriptVLCPlugin: MediaPlayer event - EncounteredError");
                    if(__this.eventCallback.eventEncounteredError)
                      __this.eventCallback.eventEncounteredError();
                    break;
                case __this.MediaPlayer.Event.TimeChanged:
                    if(__this.eventCallback.eventTimeChanged)
                      __this.eventCallback.eventTimeChanged();
                    //****************************************
                    //TODO:
                    // updateSubtitles(vlcAction.getPosition());
                    //***************************************
                    break;
                case __this.MediaPlayer.Event.PositionChanged:
                    if(__this.eventCallback.eventPositionChanged)
                      __this.eventCallback.eventPositionChanged();
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
          console.log("nativescriptVLCPlugin: Compatible cpu error.")
          this.eventCallback.eventCompatibleCpuError();
          return;
      }

     this.LibVLC.setOnNativeCrashListener(new this.LibVLC.OnNativeCrashListener({
          onNativeCrash :function() {
          console.log("nativescriptVLCPlugin: Native crash.");
          this.eventCallback.nativeCrashError();
          }
      }))

    this.libVLC = new this.LibVLC(org.videolan.vlc.util.VLCOptions.getLibOptions());

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
        // console.log('changeSurfaceLayout');
        let sw:number = this.activity.getWindow().getDecorView().getWidth();
        let sh:number = this.activity.getWindow().getDecorView().getHeight();

        // console.log('sw' + sw);
        // console.log('sh' + sh);

        if (this.mediaPlayer != null) {
            this.mediaPlayer.getVLCVout().setWindowSize(sw, sh);
        }

        let dw : number = sw;
        let dh : number = sh;

        let isPortrait:boolean = this.activity.getResources().getConfiguration().orientation == android.content.res.Configuration.ORIENTATION_PORTRAIT;
        // console.log('isPortrait' + isPortrait);
        if (sw > sh && this.activity.isPortrait || sw < sh && !isPortrait) {
            dw = sh;
            dh = sw;
        }

        // sanity check
        if (dw * dh == 0 || this.mVideoWidth * this.mVideoHeight == 0) {
            console.log("VLCPlayerActivity<changeSurfaceLayout>: Invalid surface size");
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
        // lp.width = 1289;
        // lp.height = 720;
        // console.log('lp.width '+  lp.width + 'lp.heigh ' + lp.height);
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
              // console.log('currentVolume' + currentVolume);
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
