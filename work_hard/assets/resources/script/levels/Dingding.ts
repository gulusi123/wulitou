import BaseLevel from "../common/BaseLevel";
import PropBar from "../common/PropBar";
import DragBox from "../common/DragBox";
import GameInfo from "../common/GameInfo";
import GameScene from "../GameScene";
import AudioService from "../common/AudioService";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Dingding extends BaseLevel {

    @property(cc.Node)
    abin: cc.Node = null;
    @property(cc.Node)
    door: cc.Node = null;
    @property(cc.Node)
    shouji: cc.Node = null;
    @property(cc.SpriteAtlas)
    levelAtlas: cc.SpriteAtlas = null;
    @property(cc.Node)
    zhaopai: cc.Node = null;
    @property(cc.Mask)
    pswdMask: cc.Mask = null;
    private isWifi = false;
    private wifiPswd = "857857";
    private havePhone = false;
    onLoad () {
        let nodes = this.sceneNode.children;
        for(let i=0; i<nodes.length; i++){
            nodes[i].x = i * cc.winSize.width;
            nodes[i].y = 0;
        }

        //动态设置背景墙的高度
        let wall = cc.find("background/wall", this.node);
        wall.height = cc.winSize.height/2;
        
        this.loadTarget(this.abin);
        this.initPageInfo(2, 3);
        this.initKeyboard();
        this.initWifiPswd();
	}

    start () {

    }

    /**
     * 按钮点击事件
     * @param e 
     * @param data 
     */
    buttonClick(e: cc.Event.EventTouch, data: string){
        if(this.isPlayerEvent()){
            return;
        }
        if(data == "dddk"){//顶顶打卡
            //显示打卡结果
            let result = cc.find("dd/result", this.shouji).getComponent(cc.Sprite);
            result.node.active = true;
            if(this.isWifi){
                result.spriteFrame = this.levelAtlas.getSpriteFrame("sj-dkcg");
                GameInfo.Instance.unlockAchieved(this.levelNum, 1,true);
                this.showLevelResult(true, 1, "顶顶在手，全勤我有");
            }else{
                result.spriteFrame = this.levelAtlas.getSpriteFrame("sj-dakashibai");
            }
        }else if(data == "sjdb" && !this.isWifi){//手机顶部按钮，并且没有连接wifi
            //显示wifi输入
            let wifi = cc.find("wifi", this.shouji);
            let dd = cc.find("dd", this.shouji);
            wifi.active = true;
            dd.active = false;
            let result = cc.find("dd/result", this.shouji).getComponent(cc.Sprite);
            result.node.active = false;
        }else if(data == "bi"){
            let bi = e.target
            if(PropBar.Instance.propExist(bi)){
                return; 
            }
            let self = this;
            PropBar.Instance.addProp(bi, function(){
                let drag: DragBox = bi.getComponent(DragBox);
                drag.node.removeComponent(cc.Button);//移除按钮事件
                drag.setInitPos(bi.getPosition());//一定要设置新的初始位置
                drag.dragabled = true;//设置组件可拖拽
                drag.setReceiveCallback(self.dragReceiver.bind(self));//绑定拖拽回调
            });
        }else if(data == "bao"){
            if(!this.havePhone){
                this.abin.getComponent(cc.Sprite).spriteFrame = this.levelAtlas.getSpriteFrame("rw-zj-sj");
                this.abin.x += 2;
                this.havePhone = true;
            }
        }else if(data == "shouji"){
            this.showPhone();
            // if(this.havePhone){
            // }
        }
    }

    /**
     * 初始化手机键盘事件
     */
    initKeyboard(){
        let keyboard = cc.find("wifi/keyboard", this.shouji);
        for(let node of keyboard.children){
            node.addComponent(cc.Button);
            let btn = node.getComponent(cc.Button);
            let btnEvent = new cc.Component.EventHandler();
            btnEvent.target = this.node; 
            btnEvent.component = "Dingding";
            btnEvent.handler = "keyboardClick";
            let temp = node.name.split("-");
            btnEvent.customEventData = temp[temp.length-1];
            btn.clickEvents.push(btnEvent);
        }
    }

    /**
     * 键点击事件
     * @param e 
     * @param data 
     */
    keyboardClick(e: cc.Event.EventTouch, data: string){
        let pswd = cc.find("wifi/input/pswd", this.shouji).getComponent(cc.Label);
        if(data != "qd" && pswd.string.length >= 8){
            return;
        }
        if(data == "del"){
            if(pswd.string.length > 0){
                pswd.string = pswd.string.substring(0, pswd.string.length - 1);
            }
        }else if(data == "qd"){
            this.connectWifi();
        }else{
            pswd.string = pswd.string + data;
        }
    }

    connectWifi(){
        let pswd = cc.find("wifi/input/pswd", this.shouji).getComponent(cc.Label);
        let tips = cc.find("wifi/tips", this.shouji);
        if(pswd.string == this.wifiPswd){
            tips.active = false;
            //密码正确，显示顶顶界面，顶部变为wifi状态
            let wifi = cc.find("wifi", this.shouji);
            wifi.active = false;
            this.isWifi = true;
            let dd = cc.find("dd", this.shouji);
            let icon = cc.find("sj-an-top/icon", this.shouji).getComponent(cc.Sprite);
            icon.spriteFrame = this.levelAtlas.getSpriteFrame("sj-wifi");
            dd.active = true;
        }else{
            tips.active = true;
        }
    }

    hidePhone(){
        let self = this;
        let action = cc.scaleTo(0.25, 0.4);
        let actionEnd = cc.callFunc(()=>{
            //self.shouji.parent.parent = self.node;
            self.shouji.parent.active = false;
            let pswd = cc.find("wifi/input/pswd", this.shouji).getComponent(cc.Label);
            pswd.string = "";
        });
        this.shouji.runAction(cc.sequence(action, actionEnd));
    }

    showPhone(){
        let scale = cc.winSize.width*0.618/this.shouji.width;
        this.shouji.setScale(0.4);
        //this.shouji.parent.parent = cc.find("Canvas");
        this.shouji.parent.active = true;
        let action = cc.scaleTo(0.25, scale);
        this.shouji.runAction(action);
    }
    initWifiPswd(){
        //this.zhaopai.on(cc.Node.EventType.TOUCH_MOVE, this.touchMove, this);
        //let wifi_pswd = cc.find("wifi_pswd", this.zhaopai).getComponent(cc.Label);
        //wifi_pswd.string = "WIFI:" + this.wifiPswd;
        let mima = cc.find("mima", this.zhaopai).getComponent(cc.Label);
        mima.string = "WIFI:" + this.wifiPswd;
    }
    zhaopai_Click(){
        if(this.isPlayerEvent()){
            return;
        }
        this.changePlayerEvent();
        let scale = cc.v2();
        this.node.getScale(scale);
        let self = this;
        let actionEnd = cc.callFunc(()=>{
            self.changePlayerEvent();
        });
        if(scale.x > 1){
            let action = cc.spawn(cc.scaleTo(1, 1), cc.moveTo(1, this.node.x, 0));
            this.node.runAction(cc.sequence(action, actionEnd));
        }else{
            let action = cc.spawn(cc.scaleTo(1, 2.5), cc.moveTo(1, this.node.x, -this.node.height/2));
            this.node.runAction(cc.sequence(action, actionEnd));
        }
    }
    /**
     * 点击打卡机
     */
    dkj_Click(e: cc.Event.EventTouch, data: string){
        if(this.isPlayerEvent()){
            return;
        }
        this.changePlayerEvent();
        let self = this;
        let dkj: cc.Node = e.target;
        let actionEnd = cc.callFunc(()=>{
            if(data == "dlk"){
                let kuang = cc.find("dkj-2-kuang", dkj);
                let dk_tip = cc.find("dk_tip", dkj);
                let time = cc.find("time", dkj);
                let action = cc.sequence(cc.fadeIn(0.5), cc.fadeOut(0.5));
                cc.tween(kuang).repeat(2, action).call(()=>{
                    dk_tip.active = true;
                    time.active = false;
                    cc.find("scene/scene_3/dkj/face2",self.node).active = true;
                    self.scheduleOnce(()=>{
                        GameInfo.Instance.unlockAchieved(self.levelNum, 3,false);
                        self.showLevelResult(false, 3, "你是否有很多问号");
                    },1.5);
                }).start();
            }else if(data == "zwdk"){
                let dk_tip = cc.find("dk_tip", dkj);
                let time = cc.find("time", dkj);
                dk_tip.active = true;
                time.active = false;
                self.scheduleOnce(()=>{
                    GameInfo.Instance.unlockAchieved(self.levelNum, 2,false);
                    self.showLevelResult(false, 2, "你总是手太凉");
                },1);
            }
        });
        let pos1 = dkj.parent.convertToWorldSpaceAR(dkj.getPosition());
        let pos2 = this.abin.parent.convertToWorldSpaceAR(this.abin.getPosition());
        let x = this.abin.x + pos1.x - pos2.x - this.abin.width/2;
        if(data == "dlk"){
            x -= 30;
        }
        let newPos = cc.v2(x, this.abin.y + pos1.y - pos2.y - this.abin.height/2 + 40);
        let action = cc.moveTo(1, newPos)
        this.abin.runAction(cc.sequence(action, actionEnd));
    }
   
    dragReceiver(drag: DragBox, receiver: cc.Collider){
        let self = this;
        this.changePlayerEvent();
        if(drag.tag == 1 && receiver.tag == 1){//用笔签到
            PropBar.Instance.removeProp(drag.node, true);
            let qiandaobiao = cc.find("scene/scene_2/qiandaobiao", this.node);
            let wzAction = cc.fadeTo(1, 255);
            let wzActionEnd = cc.callFunc(()=>{
                //名字显示后，签到表被吹走
                AudioService.Instance.playEffect("paperFly",false);
                let a = cc.sequence(cc.rotateTo(1, -25), cc.rotateTo(1, 25));
                let b = cc.moveTo(2, cc.v2(qiandaobiao.height/2 + cc.winSize.width/2 + 10, qiandaobiao.y + 75));
                let end = cc.callFunc(()=>{
                    GameInfo.Instance.unlockAchieved(self.levelNum, 4,false);
                    self.showLevelResult(false, 4, "上关风");
                });
                qiandaobiao.runAction(cc.sequence(cc.spawn(a, b), end));
                //阿斌跟着走出屏幕
                cc.tween(self.abin).to(2, {position: cc.v2(cc.winSize.width/2 + self.abin.width/2, self.abin.y + 70)}).start();
            });
            let wz = qiandaobiao.children[0];
            // wz.runAction(cc.sequence(wzAction, wzActionEnd));

            let pos1 = qiandaobiao.parent.convertToWorldSpaceAR(qiandaobiao.getPosition());
            let pos2 = this.abin.parent.convertToWorldSpaceAR(this.abin.getPosition());
            let newPos = cc.v2(this.abin.x + pos1.x - pos2.x - this.abin.width/2, this.abin.y + pos1.y - pos2.y - this.abin.height);
            cc.tween(this.abin).to(1, {position: newPos}).call(()=>{
                wz.runAction(cc.sequence(wzAction, wzActionEnd));
            }).start();
        }
    }

    showDlk(){
        if(this.isPlayerEvent()){
            return;
        }
        this.changePlayerEvent();
        let self = this;
        let actionEnd = cc.callFunc(()=>{

        });
        let action = cc.spawn(cc.scaleTo(1, 2.5), cc.moveTo(1, this.node.x - 1.5 * this.node.width/4, -this.node.height/4));
        this.node.runAction(cc.sequence(action, actionEnd));
    }

    private maskDraw(point: cc.Vec2){
        let graphics: cc.Graphics = this.pswdMask["_graphics"];
        var color = cc.color(0, 0, 0, 255);
        graphics.ellipse(point.x, point.y, 20, 20);
        graphics.lineWidth = 2;
        graphics.fillColor = color;
        graphics.fill();
    }
    private touchMove(e: cc.Event.EventTouch){
        let pos = e.touch.getLocation();
        let nodePos = this.zhaopai.convertToNodeSpaceAR(pos);
        this.maskDraw(nodePos);
    }
}
