import BaseLevel from "../common/BaseLevel";
import PropBar from "../common/PropBar";
import DragBox from "../common/DragBox";
import GameInfo from "../common/GameInfo";
import AudioService from "../common/AudioService";
import GameScene from "../GameScene";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Gongpai extends BaseLevel {

    @property(cc.Node)
    abin: cc.Node = null;
    @property(cc.Node)
    door: cc.Node = null;
    @property(cc.Node)
    dian: cc.Node = null;
    @property(cc.Node)
    shou: cc.Node = null;
    @property(cc.Node)
    gongpai: cc.Node = null;
    @property(cc.SpriteFrame)
    timeNum : Array<cc.SpriteFrame> = [];
    @property(cc.Node)
    time : cc.Node = null;
    @property(cc.Label)
    newPlayerLead : Array<cc.Label> = [];

    private startFlag = false;
    private isWin = false;
    private isGetGP = false;
    private isGameEnd = false;

    private hour : number = 8;
    private mimute : number = 59;
    private second : number = 45;

    onLoad () {
        //动态设置背景墙的高度
        let wall = cc.find("background/wall", this.node);
        wall.height = cc.winSize.height/2;
        
        this.initPageInfo(1, 1);
        this.loadTarget(this.abin);
        this.gongpai.on(cc.Node.EventType.TOUCH_START, this.gongpaiTouchStart, this);
        this.timeChange();
    }

    start () {
        this.showTipTouch(1);
   
    }
    onDestroy(){
        this.gongpai.off(cc.Node.EventType.TOUCH_START, this.gongpaiTouchStart, this);
    }

	gongpaiTouchStart(){
        if(this.startFlag){
            this.hideTipTouch();
        }
    }


    timeChange(){
        this.schedule(function(){
            if(this.hour == 9 && !this.isGameEnd
                ){
                GameInfo.Instance.unlockAchieved(this.levelNum, 2,false);
                this.showLevelResult(false, 2, "愣着干啥");
                return;
            }
            this.second ++;
            if(this.second == 60){
                this.second = 0;
                this.mimute ++;
                if(this.mimute == 60){
                    this.mimute = 0;
                    this.hour ++;
                }
            }
            this.time.getChildByName("hour").getComponent(cc.Sprite).spriteFrame
                = this.timeNum[this.hour];
            this.time.getChildByName("minute1").getComponent(cc.Sprite).spriteFrame
                = this.timeNum[Math.floor(this.mimute/10)];
            this.time.getChildByName("minute2").getComponent(cc.Sprite).spriteFrame 
                = this.timeNum[this.mimute%10];
            this.time.getChildByName("second1").getComponent(cc.Sprite).spriteFrame 
                = this.timeNum[Math.floor(this.second/10)];
            this.time.getChildByName("second2").getComponent(cc.Sprite).spriteFrame
                = this.timeNum[this.second%10];
           
        }.bind(this),1,15,0);
    }


    /**
     * 开门
     */
    openDoor(){
        let self = this;
        let doorLeft = cc.find("mask/door_left", this.door);
        let doorRight = cc.find("mask/door_right", this.door);
        let leftAnim = doorLeft.getComponent(cc.Animation);
        let rightAnim = doorRight.getComponent(cc.Animation);
        AudioService.Instance.playEffect("自动门打开",false);
        leftAnim.play("door_left");
        rightAnim.play("door_right");
        leftAnim.on("finished", ()=>{
            this.isWin = true;
            GameInfo.Instance.unlockAchieved(this.levelNum, 1,true);
            self.showLevelResult(true, 1, "刷我滴卡");
        });
    }
    
    propClick(e: cc.Event.EventTouch, data: string){
        let prop = e.target;
        if(PropBar.Instance.propExist(prop)){
            return; 
        }
        this.hideTipTouch();
        let self = this;
        let gongpai = cc.find("gongpai", prop);
        let gongpai_gua = cc.find("gongpai-gua", prop);
        gongpai.active = true;
        gongpai_gua.active = false;
        PropBar.Instance.addProp(prop, ()=>{
            let drag: DragBox = prop.getComponent(DragBox);
            drag.setInitPos(prop.getPosition());//一定要设置新的初始位置
            drag.dragabled = true;//设置组件可拖拽
            self.newPlayerLead[0].node.active = false;
            self.newPlayerLead[1].node.active = true;
            drag.setReceiveCallback(self.dragReceiver.bind(self));//绑定拖拽回调
            self.startFlag = true;
        });
    }

    dragReceiver(drag: DragBox, receiver: cc.Collider){
        //this.isWin = true;
        this.isGetGP = true;
        PropBar.Instance.removeProp(drag.node, true);
        drag.node.active = false;
        cc.find("abin/gongpai_hand",this.node).active = true;
        this.showTipTouch(3);
        this.newPlayerLead[1].node.active = false;
        this.newPlayerLead[2].node.active = true;
    }

    showTipTouch(index : number){
        this.shou.parent.active = true;
        this.shou.parent.zIndex = 100;
        this.dian.opacity = 255;
        let self = this;
        if(index == 1){
            let dianAction = cc.sequence(cc.fadeOut(0.5), cc.fadeIn(0.5)); 
            let shouAction = cc.sequence(cc.scaleTo(0.5, 1.2), cc.scaleTo(0.5, 1));
            this.shou.runAction(cc.repeatForever(shouAction));
            this.dian.runAction(cc.repeatForever(dianAction));
        }else if (index == 2){
            //移动到打卡机
            let abin = cc.find("abin", this.node);
            let wpos1 = abin.parent.convertToWorldSpaceAR(abin.getPosition());
            let initPos = this.shou.parent.getPosition();
            let pos = this.shou.parent.parent.convertToNodeSpaceAR(wpos1);
            let a1 = cc.moveTo(1, cc.v2(pos.x + 30, pos.y - 40)).easing(cc.easeCubicActionInOut());
            let a2 = cc.moveTo(0.5, cc.v2(pos.x + 30, pos.y - 40));
            let a3 = cc.callFunc(()=>{
                self.shou.parent.setPosition(initPos);
            })
            let action = cc.sequence(a1, a2, a3);
            this.shou.parent.runAction(cc.repeatForever(action));
        }else if(index == 3){
            this.hideTipTouch();
            this.shou.parent.stopAllActions();
            this.shou.parent.active = true;
            let dkj = cc.find("scene/scene_1/dkj",this.node);
            this.transportParent(this.shou.parent,dkj.parent);
            this.shou.parent.setPosition(dkj.x + 30, dkj.y);
            let dianAction = cc.sequence(cc.fadeOut(0.5), cc.fadeIn(0.5)); 
            let shouAction = cc.sequence(cc.scaleTo(0.5, 1.2), cc.scaleTo(0.5, 1));
            this.shou.runAction(cc.repeatForever(shouAction));
            this.dian.runAction(cc.repeatForever(dianAction));
        }
    }

    dkj_click(){
        if(!this.isGetGP){
            return;
        }
        if(this.isGameEnd){
            return;
        }else{
            this.isGameEnd = true;
        }
        this.newPlayerLead[2].node.active = false;
        this.hideTipTouch();
        let dkj = cc.find("scene/scene_1/dkj", this.node);
        let pos1 = dkj.parent.convertToWorldSpaceAR(dkj.getPosition());
        let pos2 = this.abin.parent.convertToWorldSpaceAR(this.abin.getPosition());
        let newPos = cc.v2(this.abin.x + pos1.x - pos2.x - this.abin.width/2, this.abin.y + pos1.y - pos2.y - dkj.height/2 - 20);
        cc.tween(this.abin).to(1, {position: newPos}).call(()=>{
            this.openDoor();
        }).start();
    }
    
    transportParent(current : cc.Node , newParent : cc.Node){
        let current_pos_world = current.convertToWorldSpaceAR(cc.v2(0,0));
        let current_queue_pos = newParent.convertToNodeSpaceAR(current_pos_world);
        current.parent = newParent;
        current.setPosition(current_queue_pos);
    }

    hideTipTouch(){
        this.shou.stopAllActions();
        this.dian.stopAllActions();
        this.shou.parent.active = false;
    }

    onReceivePropOk(){
        //只有工牌道具,将手指位置移动到道具位置
        let wpos1 = this.gongpai.parent.convertToWorldSpaceAR(this.gongpai.getPosition());
        let pos = this.shou.parent.parent.convertToNodeSpaceAR(wpos1);

        this.shou.parent.setPosition(cc.v2(pos.x + 50, pos.y - 50));
        this.showTipTouch(2);
    }
}
