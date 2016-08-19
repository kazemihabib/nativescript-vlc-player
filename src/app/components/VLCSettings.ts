let appSettings = require("application-settings");
let application= require("application");

declare var org:any;
export enum HW{
   HW_ACCELERATION_AUTOMATIC = -1,
   HW_ACCELERATION_DISABLED = 0,
   HW_ACCELERATION_DECODING = 1,
   HW_ACCELERATION_FULL = 2
}

export enum chroma{
        RGB32 = <any> "RV32",
        RGB16 = <any> "RV16",
        YUV   = <any> "YV12"
}



 export enum deblocking{
        automatic = -1,        //automatic
        deblocking_always = 0, //deblocking_always
        deblocking_nonref = 1, //deblocking_nonref
        deblocking_nonkey = 3, //deblocking_nonkey
        deblocking_all = 4     //deblocking_all
 }

export class VLCSettings{
     
    private static VLCOptions = org.videolan.vlc.util.VLCOptions;

    public static set hardwareAcceleration(hw:HW){
        this.VLCOptions.setHardwareAcceleration(hw);
    }
    
    public static get hardwareAcceleration():HW{
        return this.VLCOptions.getHardwareAcceleration();
    }

    public static set timeStretchingAudio(option:boolean){
       this.VLCOptions.setTimeStretchingAudio(option);
    }

    public static get timeStretchingAudio():boolean{
       return this.VLCOptions.getTimeStretchingAudio();
    }
    public static set frameSkip(option:boolean){
        this.VLCOptions.setFrameSkip(option);
    }

    public static get frameSkip():boolean{
        return this.VLCOptions.getFrameSkip();
    }

    public static set chromaFormat(format:chroma){
        this.VLCOptions.setChromaFormat(format);
    }

    public static get chromaFormat():chroma{
        return this.VLCOptions.getChromaFormat();
    }

    public static set verboseMode(option:boolean){
        this.VLCOptions.setVerboseMode(option);
    }

    public static get verboseMode():boolean{
        return this.VLCOptions.getVerboseMode();
    }

    public static set deblocking(value:deblocking){
        this.VLCOptions.setDeblocking(value);
    }

    public static get deblocking():deblocking{
        return this.VLCOptions.getDeblocking();
    }

    public static set networkCachingValue(value:number){
        this.VLCOptions.setNetworkCachingValue(value);

    }

    public static get networkCachingValue():number{
        return this.VLCOptions.getNetworkCachingValue();

    }

    // *****************************************************
    // -----------------------------------------------------
    // -----------------------------------------------------
    // *****************************************************


    //TODO:

    // setSubtitleSize(size:number){

    // }
    // setSubtitleColor(color:string){

    // }

    // setSubtitleBackground(option:boolean){

    // }

    // "enable_time_stretching_audio", true

    // subtitleTextEncoding(encoding:boolean){

    // }

 }
