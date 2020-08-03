import BaseLevel from "../common/BaseLevel";
import PropBar from "../common/PropBar";
import DragBox from "../common/DragBox";
import GameInfo from "../common/GameInfo";
import AudioService from "../common/AudioService";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Guomalu extends BaseLevel {

    @property(cc.SpriteAtlas)
    levelAtlas: cc.SpriteAtlas = null;
    @property(cc.Node)
    player: cc.Node = null;
    @property([cc.Node])
    car: cc.Node[] = [];
    @property(cc.Sprite)
    light: cc.Sprite = null;
    @property(cc.Node)
    
    abin : cc.Node = null;
    public playerRun = false;
    private playerSpeed = 300;
    private carRun = false;
    public runAction = true;
    private greenLight = false;
    private hitCar = false;

    public static Instance: Guomalu = null;
    onLoad () {
        Guomalu.Instance = this;
        //动态设置背景墙的高度
        let wall = cc.find("background/wall", this.node);
        wall.height = cc.winSize.height/2;
        let road = cc.find("background/road", this.node);
        road.height = cc.winSize.height + road.y;

        //将车放在屏幕外
        this.car[0].x = -(cc.winSize.width + this.car[0].width)/2;
        this.car[1].x = -(cc.winSize.width + this.car[1].width)/2;

        this.initPageInfo(1, 1);
        this.loadTarget(this.abin);
        this.registerTouche(true);
        this.carAction();
        //6秒后变绿灯
        this.scheduleOnce(this.changeGreenLight.bind(this), 6);
	}
    onDestroy () {
        this.registerTouche(false);
    }
    start () {

    }
   
    update (dt: number){
        if(!this.runAction){
            return;
        }
        
        if(this.playerRun && this.player.y < 155){
            this.player.y += dt * this.playerSpeed;
        }
        if(this.player.y >= 155){
            this.runAction = false;
            if(!this.greenLight){
                this.showLevelResult(true, 0, "真是命大")
            }else{
                this.showLevelResult(true, 0, "文明交通好市民")
            };
        }
    }
    registerTouche(register: boolean){
        if(register){
            this.node.on(cc.Node.EventType.TOUCH_START, this.touchEvent, this);
            this.node.on(cc.Node.EventType.TOUCH_END, this.touchEvent, this);
        }else{
            this.node.off(cc.Node.EventType.TOUCH_START, this.touchEvent, this);
            this.node.off(cc.Node.EventType.TOUCH_END, this.touchEvent, this);
        }
    }
    touchEvent(e: cc.Event.EventTouch){
        if(e.getType() == cc.Node.EventType.TOUCH_START){
            this.playerRun = false;
        }else if(e.getType() == cc.Node.EventType.TOUCH_END){
            this.playerRun = true;
            if(this.greenLight && !this.hitCar){
                this.hitCar = true;
                this.startHitCar();
            }
        }
    }
    changeGreenLight(){
        this.light.spriteFrame = this.levelAtlas.getSpriteFrame("deng-lv1");
        this.greenLight = true;
    }
    /**
     * 车撞动作
     */
    carHit(){
        let abin = this.player.getChildByName("abin");
        let zhuangji = this.player.getChildByName("zhuangji");
        let sprite = abin.getComponent(cc.Sprite);
        
        sprite.spriteFrame = this.levelAtlas.getSpriteFrame("rw-zj-beizhuang");
        zhuangji.active = true;
        let action = cc.moveTo(1, cc.v2(cc.winSize.width/2 + abin.width/2, abin.y + 100));
        let self = this;
        AudioService.Instance.playEffect("被车撞",false);
        let actionEnd = cc.callFunc(()=>{
            if(self.greenLight){
                GameInfo.Instance.unlockAchieved(self.levelNum, 2,false);
                self.showLevelResult(false, 2, "一慢二看三通过");
            }else{
                GameInfo.Instance.unlockAchieved(this.levelNum, 2,false);
                self.showLevelResult(false, 2, "红灯停，绿灯行");
            }
        });
        this.player.runAction(cc.sequence(action, actionEnd));
    }
    startHitCar(){
        let endPos0 = cc.v2(cc.winSize.width/2 + this.car[0].width/2, this.car[0].y);
        cc.tween(this.car[0]).to(1, {position: endPos0}).start();
    }
    carAction(){
        let initPos0 = cc.v2(-cc.winSize.width/2 - this.car[0].width/2, this.car[0].y);
        let endPos0 = cc.v2(cc.winSize.width/2 + this.car[0].width/2, this.car[0].y);
        let initPos1 = cc.v2(-cc.winSize.width/2 - this.car[1].width/2, this.car[1].y);
        let endPos1 = cc.v2(cc.winSize.width/2 + this.car[1].width/2, this.car[1].y);
        cc.tween(this.car[0]).repeat(6, cc.tween(this.car[0]).to(1, {position: endPos0}).call(()=>{
            this.car[0].setPosition(initPos0);
        })).start();
        cc.tween(this.car[1]).repeat(3, cc.tween(this.car[1]).to(2, {position: endPos1}).call(()=>{
            this.car[1].setPosition(initPos1);
        })).call(()=>{
            //停在斑马线前面
            let bmx = cc.find("scene/scene_1/banmaxian", this.node);
            let pos = cc.v2(bmx.x - bmx.width/2 - this.car[1].width/2, this.car[1].y);
            cc.tween(this.car[1]).to(1, {position: pos}).start();
        }).start();
    }

    jingaiClick(e : cc.Event.EventTouch){
        e.target.removeComponent(cc.Button);
        GameInfo.Instance.unlockAchieved(this.levelNum, 1,false);
        this.showLevelResult(false,1,"下水道美人斌");
    }
}
