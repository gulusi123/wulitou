import BaseLevel from "../common/BaseLevel";
import PropBar from "../common/PropBar";
import DragBox from "../common/DragBox";
import GameInfo from "../common/GameInfo";
import AudioService from "../common/AudioService";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Biaobai extends BaseLevel {

    @property(cc.Prefab)
    star : cc.Prefab = null;
    @property(cc.Prefab)
    rose : cc.Prefab = null;
    @property(cc.Node)
    abin : cc.Node = null;
    @property(cc.Node)
    xiaomei : cc.Node = null;
    @property(cc.Node)
    lamp : cc.Node = null;
    @property(cc.Node)
    talkContent : Array<cc.Node> = [];
    @property(cc.SpriteFrame)
    abinGetRose : cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    xiaomeiAngry : cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    abinSadly : cc.SpriteFrame = null;

    private alreadyLightCount = 0;
    private isTopStar : boolean = false;
    private talkIndex = 0;
    private isGetGift : boolean = false;
    private isTopStarDrag = false;
    private lampSortIndex = 1;

    onLoad () {
        // //动态设置背景墙的高度
        // let wall = cc.find("background/wall", this.node);
        // wall.height = cc.winSize.height/2 - wall.y;

        this.initPageInfo(1, 1);
        this.bindEvent();
        this.addProp(this.star);
        cc.log(cc.sys.localStorage.getItem(GameInfo.GAME_GIFT));
        if(Boolean(cc.sys.localStorage.getItem(GameInfo.GAME_GIFT)) == true){
            this.addProp(this.rose);
        }
	}

    start () {
    
    }
    
    addProp(preNode : cc.Prefab){
        let node = cc.instantiate(preNode);
        node.parent = this.node;
        if(PropBar.Instance.propExist(node)){
            return; 
        }
        let self = this;
        PropBar.Instance.addProp(node, ()=>{
            let drag: DragBox = node.getComponent(DragBox);
            drag.node.removeComponent(cc.Button);//移除按钮事件
            drag.setInitPos(node.getPosition());//一定要设置新的初始位置
            drag.dragabled = true;//设置组件可拖拽
            drag.setReceiveCallback(self.dragReceiver.bind(self));//绑定拖拽回调
        });
    }



    bindEvent(){
        let lamps = this.lamp.children;
        for(let i = 0 ; i < 11 ; i ++){
            let lampNode = lamps[i];
            let btn = lampNode.addComponent(cc.Button);
            let clickHandler = new cc.Component.EventHandler;
            clickHandler.target = this.node;
            clickHandler.component = "Biaobai";
            clickHandler.handler = "lampCallBack";
            clickHandler.customEventData = (i + 1) + "";
            btn.clickEvents.push(clickHandler);
        }
    }
    
    lampCallBack(e : cc.Event.EventTouch ,index : string){
        // cc.log(e.target);
        // cc.log(index);
        if(this.isTopStarDrag){
            if(this.lampSortIndex != Number(index)){
                this.lampSortIndex = 1;
                this.alreadyLightCount = 0;
                let lamps = this.lamp.children;
                for(let i = 0 ; i < 11 ; i ++){
                    let lamp = lamps[i];
                    lamp.getChildByName("light").active = false;
                    lamp.getComponent(cc.Button).interactable = true;
                }
                return;
            }
            this.lampSortIndex ++;
            let lampNode = e.target;
            lampNode.getComponent(cc.Button).interactable = false;
            lampNode.getChildByName("light").active = true;
            //lampNode.runAction(cc.blink(100,100));
            this.alreadyLightCount ++;
            if(this.alreadyLightCount == 11){
                this.toEachOther();
            } 
        }
    }

    dragReceiver(drag: DragBox, receiver: cc.Collider){
        if(drag.tag == 1 && receiver.tag == 0){
            this.isTopStarDrag = true;
            //this.alreadyLightCount ++;
            PropBar.Instance.removeProp(drag.node, false);
            receiver.node.group = "default";
            drag.node.parent = receiver.node;
            drag.node.setPosition(20,18);
            let lamps = this.lamp.children;
            for(let i = 11 ; i < lamps.length ; i ++){
                let lamp = lamps[i];
                lamp.getChildByName("light").active = true;
                //lamp.getComponent(cc.Button).interactable = true;
            }
            // if(this.alreadyLightCount == 11){
            //     this.toEachOther();
            // }
        }else if(drag.tag == 2 && receiver.tag == 1){
            PropBar.Instance.removeProp(drag.node, false);
            drag.node.active = false;
            cc.find("scene/scene_1/abin/rose",this.node).active = true;
            cc.find("scene/scene_1/abin",this.node).getComponent(cc.Sprite).spriteFrame = this.abinGetRose;
            this.isGetGift = true;
        }else{
            drag.returnInitPos();
        }
    }

    toEachOther(){
        cc.tween(this.abin).to(2,{x : -100}).start();
        cc.tween(this.xiaomei).to(2,{x : 100})
        .call(this.conversation.bind(this))
        .start();
    }
    
    /**
     * 对话
     */
    conversation(){
        this.talk(this.talkContent[this.talkIndex],function(){
            this.scheduleTask();
        }.bind(this));
    }
    
    scheduleTask(){
        let self = this;
        this.scheduleOnce(function(){
            cc.tween(self.abin).to(2,{x : -75}).start();
            cc.tween(self.xiaomei).to(2,{x : 80})
                .call(function(){
                    self.abin.active = false;
                    self.xiaomei.active = false;
                    cc.find("scene/scene_1/together",self.node).active = true;
                    self.scheduleOnce(function(){
                    self.showLevelResult(true,1,"真·官宣：我们")
                },0.5);
            })
            .start();
        },1)
    }

    talk(talkNode : cc.Node,talkOver : Function){
        cc.tween(talkNode)
        .delay(1)
        .to(1.5,{opacity : 255})
        .delay(2)
        .to(1.5,{opacity : 0})
        .call(function(){
            if(this.talkIndex < this.talkContent.length - 1){
                this.talkIndex ++;
                this.talkCallBack(this.talkIndex);
            }else{
                talkOver();
            }
        }.bind(this))
        .start();
    }
    
    /**
     * 对话回调
     * @param index 
     */
    talkCallBack(index : number){
        switch(index){
            case 1:
                this.scheduleOnce(function(){
                    if(this.isGetGift){
                        this.conversation();
                    }else{
                        this.abin.group = "default";
                        this.abin.getComponent(cc.Sprite).spriteFrame = this.abinSadly;
                        cc.tween(this.xiaomei)
                        .call(()=>{
                            this.xiaomei.getComponent(cc.Sprite).spriteFrame = this.xiaomeiAngry;
                        })
                        .to(1.5,{x : 300})
                        .call(()=>{
                            this.showLevelResult(false,2,"你是一个好人")
                        })
                        .start();
                    }
                }.bind(this),2)
                break;
            case 7:
                let option1 = cc.find("scene/scene_1/option_1",this.node);
                option1.active = true;
                cc.tween(option1)
                  .to(0.8,{scale : 1})
                  .start();
                break;
            case 8:
                let option2 = cc.find("scene/scene_1/option_2",this.node);
                option2.active = true;
                cc.tween(option2)
                  .to(0.8,{scale : 1})
                  .start();
                break;
            case 9:
                let option3 = cc.find("scene/scene_1/option_3",this.node);
                option3.active = true;
                cc.tween(option3)
                  .to(0.8,{scale : 1})
                  .start();
                break;
            default:
                this.conversation();
                break;
        }
    }
    
    buttonClick(e : cc.Event.EventTouch , data : string){
        switch(data){
            case "meinv":
                let xiaomei = cc.find("scene/scene_1/option_1/xiaomei",this.node);
                xiaomei.getComponent(cc.Button).interactable = false;
                this.showLevelResult(false,2,"毫无求生欲");
                break;
            case "xiaomei":
                let option1 = cc.find("scene/scene_1/option_1",this.node);
                let meinv = option1.getChildByName("meinv");
                meinv.getComponent(cc.Button).interactable = false;
                cc.tween(option1)
                .to(0.3,{scale : 0.1})
                .call(function(){
                    option1.active = false;
                    this.conversation();
                }.bind(this))
                .start();
                break;
            
        }
    }
    
    mimaSelect(e : cc.Event.EventTouch , data : string){
        let option2 = cc.find("scene/scene_1/option_2",this.node);
        let selects = option2.children;
        for(let i = 0 ; i < selects.length ; i ++){
            selects[i].getComponent(cc.Button).interactable = false;
        }
        cc.log("mimaSelect : " + data);
        if(data == "right"){
            cc.tween(option2)
                .to(0.3,{scale : 0.1})
                .call(function(){
                    option2.active = false;
                    this.conversation();
                }.bind(this))
                .start();
        }else{
            this.showLevelResult(false,2,"毫无求生欲");
        }
    }

    loseWeight(e : cc.Event.EventTouch , data : string){
        cc.log(1231321321321321);
        let option3 = cc.find("scene/scene_1/option_3",this.node);
        let selects = option3.children;
        for(let i = 0 ; i < selects.length ; i ++){
            selects[i].getComponent(cc.Button).interactable = false;
        }
        if(data == "right"){
            cc.tween(option3)
                .to(0.3,{scale : 0.1})
                .call(function(){
                    option3.active = false;
                    this.conversation();
                }.bind(this))
                .start();
        }else{
            this.showLevelResult(false,2,"毫无求生欲");
        }
    }

    transportParent(current : cc.Node , newParent : cc.Node){
        let current_pos_world = current.convertToWorldSpaceAR(cc.v2(0,0));
        let current_queue_pos = newParent.convertToNodeSpaceAR(current_pos_world);
        current.parent = newParent;
        current.setPosition(current_queue_pos);
    }

    
}
