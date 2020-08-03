import BaseLevel from "../common/BaseLevel";
import PropBar from "../common/PropBar"
import DragBox from "../common/DragBox"
import GameInfo from "../common/GameInfo";
import Tips from "../common/Tips";
import AudioService from "../common/AudioService";



const {ccclass, property} = cc._decorator;

@ccclass
export default class Shoujichongdian extends BaseLevel {
    
    @property(cc.Sprite)
    abin : cc.Sprite = null;
    @property(cc.Node)
    phone : cc.Node = null;
    @property(cc.Node)
    doctor : cc.Node = null;
    @property(cc.Label)
    telNum : cc.Label = null;
    @property(cc.Sprite)
    patient : cc.Sprite = null;
    @property(cc.SpriteFrame)
    usbDrag : cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    cabinetClicked : cc.SpriteFrame = null;
    @property(cc.Sprite)
    back : cc.Sprite = null;
    @property(cc.Sprite)
    strongman : cc.Sprite = null;

    private powerBankReady = false;
    private usbcableReady =false;
    public patientMove = false;
    private currentPage = 1; 
    public static instanse : Shoujichongdian = null;

    private static TEXT = {
        Win: "顶顶打卡就是牛",
        OutTime:"打卡时间超时咯",
        NpSignal: "信号太弱啦"
    }
     
    onLoad () {
        //动态设置背景墙的高度
        let wall = cc.find("background/wall", this.node);
        wall.height = cc.winSize.height/2;
        Shoujichongdian.instanse = this;
        this.initPageInfo(2, 2);
        this.loadTarget(this.abin.node);
    }
    
    phoneScale(e: cc.Event.EventTouch,str){
        switch(str){
            case  "open":
                this.changePlayerEvent();
                this.phone.active = true;
                this.abin.node.getChildByName("phone_button")
                .getComponent(cc.Button).interactable = false;
                break;
            case  "close":
                this.closePhone();
                break;
        }
    }
    
    closePhone(){
        let tip = this.phone.getChildByName("telPhone").getChildByName("tips");
        tip.active = false;
        this.changePlayerEvent();
        this.phone.active = false;
        this.abin.node.getChildByName("phone_button")
            .getComponent(cc.Button).interactable = true;
        this.telNum.string = "";
        this.back.node.active = false;
        this.phone.getChildByName("telPhone").getChildByName("callPhone")
            .active = false;
    }

    btn_back(){
        let telNumStr = this.telNum.string;
        if(telNumStr != ""){
           this.telNum.string = telNumStr.substr(0,telNumStr.length-1);
        }
        if(this.telNum.string.length == 0){
           this.back.node.active = false;
        }
    }
    
    inputNum(e : cc.Event.EventTouch , num : number){
        if(this.telNum.string.length >= 11){
            return;
        }
        this.telNum.string = this.telNum.string + num + "";
        if(this.telNum.string.length >= 0){
            this.back.node.active = true;
        }
    }
    
    patientClick(e : cc.Event.EventTouch){
        this.changePlayerEvent();
        this.abin.node.getChildByName("phone_button")
                .getComponent(cc.Button).interactable = false;
        this.abin.node.removeAllChildren();
        let patient = e.target;
        patient.removeComponent(cc.Button);
        let anim = this.abin.getComponent(cc.Animation);
        anim.play("abinMove");
        anim.on("finished",function(){
            GameInfo.Instance.unlockAchieved(this.levelNum, 2,false);
            this.showLevelResult(false,3,"生命不可承受之重")
        }.bind(this));
    }
     
    strongmanClick(e : cc.Event.EventTouch){
        this.showLevelResult(false,4,"我只想让你帮个忙QAQ");
    }

    cabinetClick(e : cc.Event.EventTouch){
        AudioService.Instance.playEffect("boxOpen",false);
        let cabinet = e.target;
        cabinet.removeComponent(cc.Button);
        cabinet.getComponent(cc.Sprite).spriteFrame = this.cabinetClicked;
        let usbCable = cabinet.getChildByName("shujuxian");
        usbCable.active = true;
        usbCable.getComponent(cc.Button).interactable = true;
    }

    doorClick(e : cc.Event.EventTouch){
        if(!this.patientMove){
            this.patient.getComponent(cc.Button).interactable = false;
        }
        let door = e.target;
        door.removeComponent(cc.Button);
        this.strongman.node.removeComponent(cc.Button);
        AudioService.Instance.playEffect("电梯开门",false);
        let door_left_anim = door.getChildByName("door_left").getComponent(cc.Animation);
        let door_right_anim = door.getChildByName("door_right").getComponent(cc.Animation);
        door_left_anim.play("door_left");
        door_right_anim.play("door_right");
        door_right_anim.on("finished",this.moveToDianTi,this);
    }
    
    moveToDianTi(){
        let anim = this.abin.getComponent(cc.Animation);
        anim.play("abinMoveToDT");
        //animState.
        anim.on("finished",function(){
            anim.off("finished");
            this.showLevelResult(true,1,"紧急救援");
        }.bind(this));
    }
    
    isStopMove(){
        let anim = this.abin.getComponent(cc.Animation);
        anim.stop("abinMoveToDT");
        GameInfo.Instance.unlockAchieved(this.levelNum, 1,false);
        this.showLevelResult(false,2,"别走,救我")
    }

    prop_collect(e: cc.Event.EventTouch){
        let prop = e.target
        if(PropBar.Instance.propExist(prop)){
            return; 
        }
        let self = this;
        PropBar.Instance.addProp(prop, ()=>{
            let drag: DragBox = prop.getComponent(DragBox);
            drag.node.removeComponent(cc.Button);//移除按钮事件
            drag.setInitPos(prop.getPosition());//一定要设置新的初始位置
            drag.dragabled = true;//设置组件可拖拽
            drag.setReceiveCallback(self.dragReceiver.bind(self));//绑定拖拽回调
        });
    }
    
    /**
     * 道具接收
     * @param drag 
     * @param receiver 
     */
    dragReceiver(drag: DragBox, receiver: cc.Collider){
        let tag_prop = drag.tag;
        if(receiver.tag == 2){
            switch(tag_prop){
                case 0: //充电器
                    PropBar.Instance.removeProp(drag.node);
                    drag.dragabled = false;
                    drag.node.active = false;
                    drag.node.setPosition(60, 40);
                    this.abin.node.getChildByName("chongdianqi").active = true;
                    this.powerBankReady = true;
                    break;
                case 1://充电线
                    if(this.powerBankReady){
                        PropBar.Instance.removeProp(drag.node);
                        drag.dragabled = false;
                        drag.node.parent = receiver.node;
                        drag.node.getComponent(cc.Sprite).spriteFrame = this.usbDrag;
                        this.usbcableReady = true;
                        drag.node.setPosition(15,11);
                        this.powerChange();
                    }else{
                        drag.returnInitPos();
                    }
                    break;
                // case 2://病人
                //     cc.log("病人拦路");
                //     let anim = this.abin.getComponent(cc.Animation);
                //     anim.stop("abinMoveToDT");
                //     break;
            }
        }else{
            drag.returnInitPos();
        }
    }
    
    /**
     * 电量修改
     */
    powerChange(){
        let power = this.phone.getChildByName("telPhone").getChildByName("power");
        power.getChildByName("powerNotEnough").active = false;
        power.getChildByName("powerFull").active = true;
    }
    
    appClick(e : cc.Event.EventTouch){
        if(!this.powerBankReady || !this.usbcableReady){
            AudioService.Instance.playEffect("batterylow",false);
            let tip = this.phone.getChildByName("telPhone").getChildByName("tips");
            tip.active = true;
            return;
        }else{
            this.phone.getChildByName("telPhone").getChildByName("callPhone").active = true;
        }
    }

    /**
     * 打电话
     * @param e 
     */
    callPhone(e : cc.Event.EventTouch){
        cc.log("call Phone");
        let telNumber = this.telNum.string;
        if(telNumber != "120"){
            this.showLevelResult(false,1,"冷静！不要方张！");
            return;
        }
        if(this.currentPage == 0 ){
            this.changePlayerEvent();
            this.nextScene();
        }
        this.closePhone();
        AudioService.Instance.playEffect("救护车警报",true);
        this.patient.node.removeComponent(cc.Button);
        cc.tween(this.doctor)
        .to(2,{position : cc.v2(-107.9,-220)})
        .to(1,{position : cc.v2(-30.7,25.1)})
        .call(this.doctorMoveOut.bind(this))
        .start();
    }
    
    /**
     * 医生移出屏幕
     */
    doctorMoveOut(){
        this.patient.node.parent = this.doctor;
        this.patient.node.setPosition(10,-2);
        this.patientMove = true;
        cc.tween(this.doctor)
        .to(1.5,{position : cc.v2(700,25.1)})
        .call(function(){
            AudioService.Instance.stopTargetEffect("救护车警报");;
        }.bind(this))
        .start();
    }
    
    sceneChange(type :number ,index :number){
        this.currentPage = index;
    }

    update (dt) {
       
    }

}
