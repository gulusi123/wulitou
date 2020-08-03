import BaseLevel from "../common/BaseLevel";
import PropBar from "../common/PropBar";
import DragBox from "../common/DragBox";
import AudioService from "../common/AudioService";
import GameInfo from "../common/GameInfo";

const {ccclass, property} = cc._decorator;

@ccclass
export default class superman extends BaseLevel {
    @property(cc.Sprite)
    bag : cc.Sprite = null;
    @property(cc.Sprite)
    waitao : cc.Sprite = null;
    @property(cc.Sprite)
    neiyi : cc.Sprite = null;
    @property(cc.Sprite)
    neiku : cc.Sprite = null;
    @property(cc.Sprite)
    mask : cc.Sprite = null;
    @property(cc.Sprite)
    pifeng : cc.Sprite = null;
    @property(cc.Sprite)
    model2 : cc.Sprite = null;
    @property(cc.Sprite)
    carpet : cc.Sprite = null;
    @property(cc.Sprite)
    pf1 : cc.Sprite = null;
    @property(cc.Sprite)
    pf2 : cc.Sprite = null;
    @property(cc.Node)
    glasses : cc.Node = null;
    @property(cc.Sprite)
    carpetDrag : cc.Sprite = null;
    @property(cc.Sprite)
    abin_init : cc.Sprite = null;
    @property(cc.Sprite)
    abin_waitao : cc.Sprite = null;
    @property(cc.Sprite)
    abin_neiyi : cc.Sprite = null;
    @property(cc.Sprite)
    abin_neiku : cc.Sprite = null;
    @property(cc.Sprite)
    superMan : cc.Sprite = null;
    @property(cc.Node)
    abin : cc.Node = null;
    @property(cc.Node)
    carpetState : cc.Node = null;
    @property(cc.Node)
    huanzhuang : cc.Node = null;
    
    private static TEXT = {
        Win: "我想开了",
        Dian: "触电的那种感觉慢慢出现",
        JuZi: "磨刀不误砍柴功"
    }

    private isGlassesDrag = false;
    private isBagDrag = false;
    private neikuDrag = false;
    private currentState = 1;

    onLoad () {
        // let wall = cc.find("background/wall", this.node);
        // wall.height = cc.winSize.height/2;
        this.initPageInfo(1, 1);
        this.loadTarget(this.abin);
	}
    
    paidui(e : cc.Event.EventTouch){
        e.target.removeComponent(cc.Button);
        let anim = this.abin.getComponent(cc.Animation);
        anim.play("abin_paidui");
        let self = this;
        anim.on("finished",function(){
           if(self.currentState == 5){
                self.showLevelResult(false,6,"看！果男")
                GameInfo.Instance.unlockAchieved(self.levelNum, 3,false);
           }else if(self.currentState == 4){
                self.showLevelResult(false,5,"阿斌的新衣")
                GameInfo.Instance.unlockAchieved(self.levelNum, 2,false);
           }else{
                self.showLevelResult(false,0,"人从众众众众")
           }
        });
    }
    
    prop_collect(e: cc.Event.EventTouch , str ){
        let prop = e.target
        let self = this;
        if(PropBar.Instance.propExist(prop)){
            return; 
        }
        prop.removeComponent(cc.Button);
        switch(str){
            case "init":
                prop.removeComponent(cc.Button);
                this.bag.node.active = true;
                prop = this.bag.node;
                this.isBagDrag = true;
                this.abin_init.node.active = false;
                this.abin_waitao.node.active = true;
                this.glasses.active = false;
                this.isGlassesDrag = true;
                break;
            case "waitao":
                this.currentState = 2;
                this.waitao.node.active = true;
                this.abin_waitao.node.active = false;
                this.abin_neiyi.node.active = true;
                prop = this.waitao.node;
                break;
            case "neiyi":
                this.currentState = 4;
                this.abin_neiyi.node.active = false;
                this.abin_neiku.node.active = true;
                this.neiku.node.active = true;
                this.neiyi.node.active = true;
                prop = this.neiyi.node;
                break;
            case "neiku":
                this.neikuDrag = true;
                this.currentState = 5;
                break;
            case "pifeng":
                this.model2.node.active = false;
                this.pifeng.node.active = true;
                prop = this.pifeng.node;
                break;
            case "carpet":
                this.carpet.node.active = true;
                prop.active = false;
                prop = this.carpet.node;
                break;
        }
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
        if(receiver.tag == 10){
            switch(tag_prop){
                case 1: //内裤
                    PropBar.Instance.removeProp(drag.node);
                    drag.dragabled = false;
                    drag.node.parent = receiver.node;
                    drag.node.setPosition(cc.v2(5.799, -21.066));
                    this.neikuDrag = false;
                    if(this.currentState == 5){
                        this.currentState = 4;
                    }else if (this.currentState == 2){
                        this.currentState = 3; 
                    }
                    break;
                case 2://内衣
                    if(this.currentState == 4){
                        this.neiku.node.active = false;
                    }
                    this.currentState = 2;
                    PropBar.Instance.removeProp(drag.node);
                    drag.dragabled = false;
                    this.abin_neiyi.node.active = true;
                    drag.node.active = false;
                    break;
                case 3 ://外套
                    if(this.currentState == 2 && this.neikuDrag == false){
                        this.currentState = 1;
                        PropBar.Instance.removeProp(drag.node);
                        drag.dragabled = false;
                        drag.node.active = false;
                        this.abin_waitao.node.active = true;
                    }else{
                        drag.returnInitPos();
                    }
                    break;
                case 4 ://披风
                    PropBar.Instance.removeProp(drag.node);
                    drag.dragabled = false;
                    if(this.currentState == 3 && this.isGlassesDrag){
                        this.abin_neiyi.node.active = false;
                        this.superMan.node.active = true;
                    }else{
                        this.pf1.node.active = true;
                        this.pf2.node.active = true;
                    }
                    this.abinFlyByPF();
                    break;
                case 5://毯子
                    this.huanzhuang.active = false;
                    PropBar.Instance.removeProp(drag.node);
                    drag.dragabled = false;
                    this.abinFlyByFT();
                    break;
            }
        }else{
            drag.returnInitPos();
        }
    }
    
    abinFlyByPF(){
        let anim = this.abin.getComponent(cc.Animation);
        AudioService.Instance.playEffect("flyup",false);
        anim.play("abinFlyByPF");
        let self = this;
        anim.on("finished",function(){
            anim.off("finished");
            if(self.currentState == 3 && self.isGlassesDrag){
                self.showLevelResult(true,1,"I'm Superman!");
                GameInfo.Instance.unlockAchieved(self.levelNum, 1,true);
            }else{
                AudioService.Instance.playEffect("flydown",false);
                anim.play("abinFlyDown");
                anim.on("finished",function(){
                    let index = this.currentState + 3;
                    if(this.currentState > 3){
                        index --;
                    }
                    GameInfo.Instance.unlockAchieved(this.levelNum, index ,false);
                    self.showLevelResult(false,2*10 + this.currentState,"山寨的代价")
                }.bind(self));
            }
        });
    }

    abinFlyByFT(){
        this.carpetDrag.node.active = true;
        AudioService.Instance.playEffect("flyup",false);
        this.carpetState.getChildByName("abin_carpet_"+ this.currentState).active = true;
        let anim = this.abin.getComponent(cc.Animation);
        anim.play("abinFlyByPF");
        let self = this;
        anim.on("finished",function(){
            anim.off("finished");
            AudioService.Instance.playEffect("flydown",false);
            anim.play("abinFlyDown");
            anim.on("finished",function(){
                GameInfo.Instance.unlockAchieved(this.levelNum, this.currentState + 7,false);
                self.showLevelResult(false,3*10 + this.currentState,"低配版阿拉丁")
            }.bind(self));
        });
    }
}
