import LevelInfo from "./LevelInfo";
import GameInfo from "./GameInfo";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Tips extends cc.Component {

    public static Instance: Tips = null;
    @property(cc.SpriteAtlas)
    resAtlas: cc.SpriteAtlas = null;
    @property(cc.Sprite)
    tipSprite: cc.Sprite[] = [];
    @property(cc.Label)
    tipLabel: cc.Label[] = [];
    @property(cc.JsonAsset)
    tipText: cc.JsonAsset = null;

    private level: number = 1;
    private tipIndex = 0;
    onLoad () {
        Tips.Instance = this;
        if(cc.sys.platform == cc.sys.ANDROID){
            //android绑定调用
            window["tipLevelIndex"] = this.tipLevelIndex.bind(this);
        }
	}

    start () {

    }
    
    show(){
        let w = this.node.getChildByName("window");
        w.setScale(0.2);
        this.node.active = true;
        let a = cc.scaleTo(0.2, 1, 1);
        w.runAction(a);
    }
    close(){
        let w = this.node.getChildByName("window");
        let a = cc.scaleTo(0.2, 0.2, 0.2);
        let self = this;
        let finished = cc.callFunc(function(){
            self.node.active = false;
        })
        w.runAction(cc.sequence(a, finished));
    }

    initTips(level: number){
        this.level = level;
        let info = GameInfo.Instance.getLevelInfo(level);
        for(let i=0; i<info.tipState.length; i++){
            this.tipSprite[i].spriteFrame = this.resAtlas.getSpriteFrame("tishi-di" + info.tipState[i]);
            if(info.tipState[i] == LevelInfo.TIP_STAT_ON){
                this.tipLabel[i].string = this.tipText.json[this.level-1][i];
            }else{
                this.tipLabel[i].string = "";
            }
        }
    }
    showTip(e:cc.Event.EventTouch, data: string){
        let index = Number(data);
        let info = GameInfo.Instance.getLevelInfo(this.level);
        if(info.tipState[index] == LevelInfo.TIP_STAT_ON || info.tipState[index] == LevelInfo.TIP_STAT_LOCK){
            return;
        }
        this.tipIndex = index;
        //预加载视频
        //this.preloadVideo();
        this.tipLevelIndex(this.tipIndex);
    }
    preloadVideo(){
        if(cc.sys.platform == cc.sys.ANDROID){
            let self = this;
            if(window["video"] == null){
                window["video"] = {
                    preloadError: self.preloadError.bind(self),
                    preloadSuccess: self.preloadSuccess.bind(self),
                    onVerify:  self.onVerify.bind(self),
                    onShow: self.onShow.bind(self),
                    onComplete: self.onComplete.bind(self)
                };
            }
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/SdkApi", "showRewardedAd", "(Ljava/lang/String;ZI)V", "test", false, cc.winSize.width - 20)
            cc.find("mask2", this.node).active = true;
        }
    }
    showVideo(){

    }
    onVerify(verify: boolean, amount: number, name: string){

    }
    onShow(){
        cc.find("mask2", this.node).active = false;
    }
    preloadError(code: number, msg: string){
        cc.log("预加载错误" + code + "-->" + msg);
    }
    
    preloadSuccess(id: string){
        cc.log("预加载回调--->" + id);
        // if(cc.sys.platform == cc.sys.ANDROID){
        //     jsb.reflection.callStaticMethod("org/cocos2dx/javascript/SdkApi", "showRewardedAd", "(Ljava/lang/String;)V", id);
        //     cc.find("mask2", this.node).active = false;
        // }
    }

    onComplete(){
        cc.log("播放完成回调");
        this.tipLevelIndex(this.tipIndex);
    }

    private tipLevelIndex(index: number){
        let info = GameInfo.Instance.getLevelInfo(this.level);
        info.tipState[index] = LevelInfo.TIP_STAT_ON;
        this.tipSprite[index].spriteFrame = this.resAtlas.getSpriteFrame("tishi-di" + LevelInfo.TIP_STAT_ON);
        if(this.level <= this.tipText.json.length && index < this.tipText.json[this.level-1].length){
            this.tipLabel[index].string = this.tipText.json[this.level-1][index];
        }
        if(index < info.tipState.length-1){
            info.tipState[index+1] = LevelInfo.TIP_STAT_OFF;
            this.tipSprite[index+1].spriteFrame = this.resAtlas.getSpriteFrame("tishi-di" + LevelInfo.TIP_STAT_OFF);
        }
        GameInfo.Instance.setLevelInfo(info);
    }
}
