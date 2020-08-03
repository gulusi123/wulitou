import BaseLevel from "../common/BaseLevel";
import PropBar from "../common/PropBar";
import DragBox from "../common/DragBox";
import GameInfo from "../common/GameInfo";
import AudioService from "../common/AudioService";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Gongzifenpei extends BaseLevel {

    @property(cc.Node)
    gold : cc.Node = null;
    @property(cc.SpriteFrame)
    goldNormal : cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    goldPressed : cc.SpriteFrame = null;
    @property(cc.Label)
    balance : cc.Label = null;
    @property(cc.Node)
    option : cc.Node = null;
    @property(cc.SpriteFrame)
    optionBg : Array<cc.SpriteFrame> = [];
    @property(cc.SpriteFrame)
    optionNumBg : Array<cc.SpriteFrame> = [];


    private cureentClickGoldNode = null;
    private fenpei  = [0,0,0,0,0,0,0,0,0];
    private decrease = [50,40,15,5,45,42.5,25,17.5,20];
    private decreaseEnd = false;

    private areadyFenPeiCount = 0;
    onLoad () {
        // //动态设置背景墙的高度
        // let wall = cc.find("background/wall", this.node);
        // wall.height = cc.winSize.height/2 - wall.y;

        this.initPageInfo(1, 1);
        this.bindEvent();
        this.bindOptionClickHandler();
	}

    start () {
    
    }
    
    bindEvent(){
        let golds = this.gold.children;
        for(let i = 0 ; i < golds.length ; i ++){
            let normal = golds[i].getChildByName("normal");
            // //设置拖动初始位置
            // normal.getComponent(DragBox).setInitPos(normal.getPosition());
            // //绑定拖动碰撞回调
            // normal.getComponent(DragBox).setReceiveCallback(this.dragReceiver.bind(this));
            //绑定触摸事件
            normal.on("touchstart",function(){
                if(this.cureentClickGoldNode != null){
                    this.cureentClickGoldNode.getComponent(cc.Sprite)
                    .spriteFrame = this.goldNormal;
                }
                let sf = normal.getComponent(cc.Sprite).spriteFrame;
                if(sf.name == "chaopiao"){
                    normal.getComponent(cc.Sprite).spriteFrame = this.goldPressed;
                    this.cureentClickGoldNode = normal;
                }else{
                    normal.getComponent(cc.Sprite).spriteFrame = this.goldNormal;
                    this.cureentClickGoldNode = null;
                }
            }.bind(this));
        }
    }

    /**
     * 绑定可分配选项点击事件
     */
    bindOptionClickHandler(){
        let options = this.option.children;
        for(let i = 0 ; i < options.length ; i++){
            let btn = options[i].addComponent(cc.Button);
            let handler = new cc.Component.EventHandler();
            handler.target = this.node;
            handler.component = "Gongzifenpei";
            handler.handler = "buttonClick";
            handler.customEventData = (i + 1) + "";
            btn.clickEvents.push(handler);
        }
    }
    
    /**
     * 
     * @param e 按钮点击事件
     */
    buttonClick(e : cc.Event.EventTouch , index : number){
        let option  = e.target;
        if(this.cureentClickGoldNode == null){
            //当前没有选中钞票
            return;
        }
        option.removeComponent(cc.Button);
        this.cureentClickGoldNode.active = false;
        let money = Number(this.cureentClickGoldNode.parent.name);
        this.fenpei[index-1] = money;
        let num = option.getChildByName("showNum").getChildByName("num");
        num.getComponent(cc.Label).string = money + "";
        this.balance.string = (Number(this.balance.string) - money) + "";
        this.areadyFenPeiCount ++;
        this.cureentClickGoldNode = null;
        option.getComponent(cc.Sprite).spriteFrame = this.optionBg[0];
        option.getChildByName("showNum").getComponent(cc.Sprite).spriteFrame = this.optionNumBg[0];
        if(this.areadyFenPeiCount == 9){
            this.decreaseBySecond();
        }
    }

    dragReceiver(drag: DragBox, receiver: cc.Collider){
        let re_tag = receiver.tag;
        let money = Number(drag.propName);
        receiver.node.group = "default";
        drag.node.active = false;
        this.fenpei[re_tag-1] = money;
        let num = receiver.node.getChildByName("showNum").getChildByName("num");
        num.getComponent(cc.Label).string = money + "";
        this.balance.string = (Number(this.balance.string) - money) + "";
        this.areadyFenPeiCount ++;
        if(this.areadyFenPeiCount == 9){
            this.decreaseBySecond();
        }
    }
    
    decreaseBySecond(){
        this.schedule(function(){
            AudioService.Instance.playEffect("countdown",false);
            if(this.decreaseEnd){
                return;
            }
            let options = this.option.children;
            for(let i = 0 ; i < options.length ; i ++){
                let num = options[i].getChildByName("showNum").getChildByName("num");
                let cureentNum = Number(num.getComponent(cc.Label).string);
                if(cureentNum - this.decrease[i] < 0){
                    num.getComponent(cc.Label).string = "0";
                    continue;
                }
                num.getComponent(cc.Label).string = (cureentNum - this.decrease[i]);
                if(Number(num.getComponent(cc.Label).string) <= this.decrease[i]){
                    options[i].getComponent(cc.Sprite).spriteFrame = this.optionBg[1];
                    options[i].getChildByName("showNum").getComponent(cc.Sprite).spriteFrame = this.optionNumBg[1];
                }
            }
            this.stastical();
        }.bind(this),1.5,21,1);
    }

    stastical(){
        let options = this.option.children;
        let usedAllCount = 0;
        let index = 0;
        for(let i = 0 ; i < options.length ; i ++){
            let num = options[i].getChildByName("showNum").getChildByName("num");
            let cureentNum = Number(num.getComponent(cc.Label).string);
            if(cureentNum == 0){
                index = i;
                usedAllCount  ++ ;
                this.decreaseEnd = true;
            }
        }
        cc.log("用完的钱 ：" + usedAllCount + " | " + index);
        if(usedAllCount == 9){
            this.unscheduleAllCallbacks();
            cc.sys.localStorage.setItem(GameInfo.GAME_GIFT,true);
            this.showLevelResult(true,10,"月光社畜")
            
        }else if(usedAllCount > 0){
            this.unscheduleAllCallbacks();
            let tip  = "" ;
            switch(index + 1){
                case 1:
                    tip ="百善孝为先";
                    break;
                case 2:
                    tip ="你我本有缘，只因我没钱";
                    break;
                case 3:
                    tip ="中年油腻大叔";
                    break;
                case 4:
                    tip ="每天早起11路公交车,太困啦";
                    break;
                case 5:
                    tip ="最后一根火柴";
                    break;
                case 6:
                    tip ="你见过凌晨6点的郊区吗？";
                    break;
                case 7:
                    tip ="十动然拒";
                    break;
                case 8:
                    tip ="氪金的快乐你想象不到";
                    break;
                case 9:
                    tip ="长江后浪拍前浪";
                    break;
            }
            this.showLevelResult(false,index + 1,tip)
        }
    }

    transportParent(current : cc.Node , newParent : cc.Node){
        let current_pos_world = current.convertToWorldSpaceAR(cc.v2(0,0));
        let current_queue_pos = newParent.convertToNodeSpaceAR(current_pos_world);
        current.parent = newParent;
        current.setPosition(current_queue_pos);
    }

    
}
