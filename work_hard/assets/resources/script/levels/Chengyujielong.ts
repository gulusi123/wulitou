import BaseLevel from "../common/BaseLevel";
import AudioService from "../common/AudioService";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Chengyujielong extends BaseLevel {

    @property(cc.Node)
    shouji: cc.Node = null;
    @property(cc.Node)
    car: cc.Node = null;
    @property(cc.Node)
    abin: cc.Node = null;
    @property(cc.SpriteAtlas)
    otherAtlas: cc.SpriteAtlas = null;
    @property(cc.Node)
    apps: cc.Node[] = []

    private timer = 0;
    private failTime = 0;
    private failTimeFlag = true;
    private touched = false;
    private uninstQe = false;
    private msgTimer = false;
    private appAction = false;
    onLoad () {
		//动态设置背景墙的高度
        let wall = cc.find("background/wall", this.node);
        wall.height = cc.winSize.height/2;
        let road = cc.find("background/road", this.node);
        road.height = cc.winSize.height + road.y;

        //将车放在屏幕外
        this.car.x = -(cc.winSize.width + this.car.width)/2;

        this.initPageInfo(1, 1);
        this.loadTarget(this.abin);
        this.registerAppTouch(true);
	}

    start () {
    }
    
    onDestroy () {
        this.registerAppTouch(false);
    }

    update (dt: number){
        if(this.touched){
            this.timer += dt;
            if(this.timer >= 1){
                this.startUninstAction();
            }
        }
        if(this.failTimeFlag){
            this.failTime += dt;
            if(this.failTime >= 30){
                this.failTimeFlag = false;
                this.showLevelResult(false, 2, "龙王争霸赛");
            }
        }
    }
    buttonClick(e: cc.Event.EventTouch, data: string){
        if(data == "shouji"){
            this.showPhone();
        }else if(data == "ren"){
            this.carHit(e.target);
        }else if(data == "app"){
            //进入主界面
            this.intoApp(e.target);
        }else if(data == "dddk" && this.uninstQe){
            //只有卸载了企鹅才能打卡
            this.failTimeFlag = false;
            this.showLevelResult(true, 1, "退赛保全勤");
        }
    }
    registerAppTouch(register: boolean){
        for(let app of this.apps){
            if(register){
                app.on(cc.Node.EventType.TOUCH_START, this.appTouchEvent, this);
                app.on(cc.Node.EventType.TOUCH_END, this.appTouchEvent, this);
            }else{
                app.off(cc.Node.EventType.TOUCH_START, this.appTouchEvent, this);
                app.off(cc.Node.EventType.TOUCH_END, this.appTouchEvent, this);
            }
        }
    }
    appTouchEvent(e: cc.Event.EventTouch){
        if(e.getType() == cc.Node.EventType.TOUCH_START){
            this.timer = 0;
            this.touched = true;
        }else if(e.getType() == cc.Node.EventType.TOUCH_END){
            this.touched = false;
            if(this.timer >= 1){
                this.startUninstAction();
            }else{
                this.intoApp(e.target);
            }
        }
    }
    /**
     * 卸载app
     */
    uninstApp(e: cc.Event.EventTouch, data: string){
        e.target.parent.active = false;
        if(data == "dd"){
            this.failTimeFlag = false;
            this.showLevelResult(false, 5, "手误");
        }else if(data == "qe"){
            this.uninstQe = true;
        }
        this.stopUninstAction();
    }
    startUninstAction(){
        if(this.appAction){
            return;
        }
        this.appAction = true;
        let dd = cc.find("main/app-dd", this.shouji);
        let qe = cc.find("main/app-qe", this.shouji);
        dd.children[0].active = true;
        qe.children[0].active = true;
        dd.angle = 5;
        qe.angle = 5;
        cc.tween(dd).repeat(cc.macro.REPEAT_FOREVER, cc.tween(dd).to(0.2, {angle: -5}).to(0.2, {angle: 5})).start();
        cc.tween(qe).repeat(cc.macro.REPEAT_FOREVER, cc.tween(qe).to(0.2, {angle: -5}).to(0.2, {angle: 5})).start();
    }
    stopUninstAction(){
        this.appAction = false;
        let dd = cc.find("main/app-dd", this.shouji);
        let qe = cc.find("main/app-qe", this.shouji);
        dd.stopAllActions();
        qe.stopAllActions();
        dd.children[0].active = false;
        qe.children[0].active = false;
        dd.angle = 0;
        qe.angle = 0;
    }
    hidePhone(){
        let self = this;
        let action = cc.scaleTo(0.5, 0.4);
        let actionEnd = cc.callFunc(()=>{
            //self.shouji.parent.parent = self.node;
            self.shouji.parent.active = false;
        });
        this.shouji.runAction(cc.sequence(action, actionEnd));
    }

    showPhone(){
        let scale = cc.winSize.width*0.618/this.shouji.width;
        this.shouji.setScale(0.4);
        //this.shouji.parent.parent = cc.find("Canvas");
        this.shouji.parent.active = true;
        let action = cc.scaleTo(0.5, scale);
        this.shouji.runAction(action);
    }
    carHit(ren: cc.Node){
        ren.removeComponent(cc.Button);
        //计算阿斌行走时与car相交的点
        let y = this.car.parent.convertToWorldSpaceAR(cc.v2(0, this.car.y)).y;

        let wpos1 = this.abin.parent.convertToWorldSpaceAR(this.abin.getPosition());
        let wpos2 = ren.parent.convertToWorldSpaceAR(ren.getPosition());
        let x = (y - wpos1.y) * (wpos2.x - wpos1.x)/(wpos2.y - wpos1.y) + wpos1.x;
        let carPos = this.car.parent.convertToNodeSpaceAR(cc.v2(x, y));
        carPos.x -= this.car.width/2;
        let abinPos = this.abin.parent.convertToNodeSpaceAR(cc.v2(x, y));
        let self = this;
        
        cc.tween(this.car).to(0.5, {position: carPos}).
            call(function(){
                AudioService.Instance.playEffect("brake",false)
            }).start();
        cc.tween(this.abin).to(0.5, {position: abinPos}).call(()=>{
            AudioService.Instance.playEffect("被车撞",false)
            let sprite = cc.find("rw-zj", self.abin).getComponent(cc.Sprite);
            let zhuangji = cc.find("zhuangji", self.abin)
            sprite.spriteFrame = self.otherAtlas.getSpriteFrame("rw-zj-beizhuang");
            zhuangji.active = true;
            cc.tween(self.abin).to(1, {position: cc.v2(cc.winSize.width/2 + sprite.node.width/2, self.abin.y + 200)}).call(()=>{
                this.failTimeFlag = false;
                self.showLevelResult(false, 4, "各行其道，安全可靠");
            }).start();
        }).start();
    }
    intoApp(app: cc.Node){
        let main = cc.find("main", this.shouji);
        let dd = cc.find("dd", this.shouji);
        let dd_qe = cc.find("dd/qe", this.shouji);
        let qe = cc.find("qe", this.shouji);
        if(app.name == "app-dd"){
            main.active = false;
            dd.active = true;
            qe.active = false;
            if(this.uninstQe){
                dd_qe.active = false;
            }else{
                if(!this.msgTimer){
                    this.msgTimer = true;
                    this.schedule(this.refreshMsg.bind(this), 0.2);
                }
            }
        }else if(app.name == "app-qe"){
            this.unscheduleAllCallbacks();
            main.active = false;
            dd.active = false;
            qe.active = true;
        }else if(app.name == "main_btn"){
            this.unscheduleAllCallbacks();
            main.active = true;
            dd.active = false;
            qe.active = false;
            if(!this.uninstQe){
                let qeMsg = cc.find("dd/qe/app-qe", this.shouji);
                while(qeMsg.childrenCount > 2){
                    qeMsg.removeChild(qeMsg.children[qeMsg.childrenCount-1], true);
                }
                this.msgTimer = false;
            }
        }
    }
    
    refreshMsg(){
        AudioService.Instance.playEffect("phoneInfoTip",false);
        let qeMsg = cc.find("dd/qe/app-qe", this.shouji);
        let lastMsg = qeMsg.children[qeMsg.childrenCount-1];
        let newMsg = cc.instantiate(lastMsg);
        newMsg.y = lastMsg.y - 40;
        qeMsg.addChild(newMsg);
    }
}
