const {ccclass, property} = cc._decorator;

@ccclass
export default class AudioService extends cc.Component {
    
    
    private effectAudios : Array<any>;
    private bgAudio : Array<any>;

    public static Instance: AudioService = null;

    /**
     * 默认背景音乐播放状态
     */
    public musicState = false;

    /**
     * 默认音效播放状态
     */
    private effectState = true;
    /**
     * 当前播放的背景音乐
     */
    private currentMusic: cc.AudioClip = null;
    private currentMusicLoop = false;
    
    /**
     * 当前播放的小音效
     */
    private cureentEffect : cc.AudioClip = null;
    /**
     * 循环播放的音效名(除背景音效以外)
     */
    private effectName : Array<string> =[];
    /**
     * 循环播放的音句柄
     */
    private effectAudioIds : Array<number> = [];

    onLoad () {
        AudioService.Instance = this;
        if(!cc.game.isPersistRootNode(this.node)){
            cc.game.addPersistRootNode(this.node);
        }
        this.loadAudio();
	}
    start () {
    }
    
    loadAudio(){
        let self = this;
        cc.loader.loadResDir("audio/bgAudio",cc.AudioClip,function(err ,assets, urls){
            self.bgAudio = assets;
        });
        cc.loader.loadResDir("audio/effectAudio",cc.AudioClip,function(err ,assets, urls){
            self.effectAudios = assets;
        });
    }

    /**
     * 播放音乐
     * @param clip 
     * @param loop 
     */
    playMusic(str : string, loop: boolean) {
        let clip = this.getBgAudio(str);
        if(clip == null){
            return;
        }
        if(cc.audioEngine.isMusicPlaying()){
            cc.audioEngine.stopMusic();
        }
        this.currentMusic = clip;
        this.currentMusicLoop = loop;
        this.musicState = true;
        cc.audioEngine.playMusic(clip, loop);
    }

    /**
     * 播放音效
     * @param clip 
     * @param loop (是否循环播放)
     * @param count(播放次数)
     * @param callBack(播放回调)
     */
    playEffect(str : string, loop: boolean, callBack ?:Function, stopAll ?: boolean){
        //关闭当前的所有音效
        if(stopAll){
            cc.audioEngine.stopAllEffects();
        }
        //获取需要播放的音效
        let clip = this.getEffectAudio(str);
        let handle : any = null;//播放音乐的句柄
        if(clip == null){
            return;
        }
        this.effectState = true;
        handle = cc.audioEngine.playEffect(clip, loop);
        if(loop){
            this.effectName.push(str);
            this.effectAudioIds.push(handle);
        }
        if(callBack){
            callBack(handle);
        }
    } 
    
    /**
     * 指定停止一个音效
     * @param str 
     */
    stopTargetEffect(str : string){
        let index = -1;
        for(let i = 0 ; i < this.effectName.length ; i ++){
            if(this.effectName[i] == str){
                index = i;
                break;
            }
        }
        if(index == -1){
            return;
        }
        this.effectName.splice[index];
        cc.audioEngine.stopEffect( this.effectAudioIds[index]);
        this.effectAudioIds.splice[index];
    }

    /**
     * 改变背景音乐播放状态
     */
    changeMusicState() {
        if(this.musicState){
            this.musicState = false;
            cc.audioEngine.stopMusic();
        }else{
            this.musicState = true;
            cc.audioEngine.playMusic(this.currentMusic, this.currentMusicLoop);
        }
    }

    /**
     * 改变音效播放状态
     */
    changeEffectState(){
        if(this.effectState){
            this.effectState = false;
            cc.audioEngine.stopAllEffects();
        }else{
            this.effectState = true;
            cc.audioEngine.playEffect(this.cureentEffect, false);
        }
    }

    getBgAudio (str: string){
        for(let i = 0 ; i < this.bgAudio.length ; i ++){
            if(this.bgAudio[i]._name == str){
                return this.bgAudio[i];
            } 
        }
    }

    getEffectAudio (str: string){
        for(let i = 0 ; i < this.effectAudios.length ; i ++){
            if(this.effectAudios[i]._name == str){
                return this.effectAudios[i];
            } 
        }
    }
    
    resetGameAudio(str ?: string){
        this.effectName = [];
        this.effectAudioIds = [];
        cc.audioEngine.stopAllEffects();
        this.playMusic(str,true);
    }

    
}

