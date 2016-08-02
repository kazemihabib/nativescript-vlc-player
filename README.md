# nativescript-vlc-player
nativescript vlc player plugin for NS-Angular2

`THIS PLUGIN IS NOT READY YET`
# How To Run Demo:
    clone this project and run `tns run android`
#  How to use in plugin in your project:
    1 - add `compile "de.mrmaffen:vlc-android-sdk:1.9.8"` to build.gradle
    2 - Copy `nativescript-vlc-plugin` in your `app` folder
    3 - Copy `VLCOptions.java`(https://github.com/kazemihabib/nativescript-vlc-player/blob/master/VLCOptions.java) to `platforms/android/src/main/java/org/videolan/vlc/util/VLCOptions.java`.
    4 - Add this to your template `<vlc></vlc>`


## TODO:
  ```
    1-handle audio tracks
    2-add PlayerControl
    3-subtitleSurfaceView
    4-@Input() for lastPosition , ...
    5-use angular2 event hanling system instead of eventCallback
    6-handle more events help:
    https://code.videolan.org/videolan/vlc-android/blob/master/vlc-android/src/org/videolan/vlc/PlaybackService.java
    and
    https://code.videolan.org/videolan/vlc-android/blob/master/vlc-android/src/org/videolan/vlc/gui/video/VideoPlayerActivity.java
  ```


## ISSUES:
  ```
    1-AspectRatio becomes Original Surface after orientation
    2-Media Events and MediaPlayer Events throw exception !!

  ```
