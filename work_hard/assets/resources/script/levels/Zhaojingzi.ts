import BaseLevel from "../common/BaseLevel";
import PropBar from "../common/PropBar";
import DragBox from "../common/DragBox";
import AudioService from "../common/AudioService";
import GameScene from "../GameScene";
import GameInfo from "../common/GameInfo";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Zhaojingzi extends BaseLevel {
    @property(cc.Node)
    Mask:cc.Node=null;
    @property(cc.Node)
    anniu:cc.Node=null;
    @property(cc.Node)
    floorTip : cc.Node = null;
    @property(cc.Node)
    door_left:cc.Node=null;
    @property(cc.Node)
    door_right:cc.Node=null;
    @property(cc.SpriteFrame)
    numSprite : Array<cc.SpriteFrame> = [];
    @property(cc.Node)
    time : cc.Node = null;
    @property(cc.Sprite)
    meinv : cc.Sprite = null;
    @property(cc.Sprite)
    daoying : cc.Sprite = null;
    @property(cc.Node)
    scene_2 : cc.Node = null;
    @property(cc.Sprite)
    jingzi : cc.Sprite = null;
    @property(cc.Sprite)
    haibao : cc.Sprite = null;
    @property(cc.Sprite)
    abin : cc.Sprite = null;

    private static TEXT = {
        Win: "我想开了",
        Dian: "触电的那种感觉慢慢出现",
        TimeOut : "上班时间到啦",
        JuZi: "磨刀不误砍柴功"
    }
    
    private dianTiMoveNum : number = 0;
    private currentFloor : number = 1;
    private isBigger = false;

    //===== time ====
    private hour : number = 8;
    private mimute : number = 58;
    private second : number = 0;
    
    private isChooseFloor = false;
    private isSuccessDk = false;
    private jiaodaiCount = 4;
    private jiaodaiFadeCount = 0;

    onLoad () {
        
        let wall = cc.find("scene/scene_1/dt-waimian", this.node);
        wall.y=this.Mask.y;
        
        this.initPageInfo(1,2);
        this.loadTarget(this.abin.node);
        //this.timeChange();
        this.bindClickHandler();
	}
    
    timeChange(){
        this.schedule(function(){
            if(this.hour == 9 && !this.isSuccessDK){
                if(!this.isPlayerEvent()){
                    this.changesmall();
                    this.showLevelResult(false, 2, Zhaojingzi.TEXT.TimeOut);
                }
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
                = this.numSprite[this.hour];
            this.time.getChildByName("minute_1").getComponent(cc.Sprite).spriteFrame
                = this.numSprite[Math.floor(this.mimute/10)];
            this.time.getChildByName("minute_2").getComponent(cc.Sprite).spriteFrame 
                = this.numSprite[this.mimute%10];
            this.time.getChildByName("second_1").getComponent(cc.Sprite).spriteFrame 
                = this.numSprite[Math.floor(this.second/10)];
            this.time.getChildByName("second_2").getComponent(cc.Sprite).spriteFrame
                = this.numSprite[this.second%10];
           
        }.bind(this),1,120,0);
    }

    bindClickHandler(){
        let anniuList = this.anniu.children;
        
        let anniu_floor = null;
        for(let i = 0 ; i < anniuList.length ; i ++){
            anniu_floor = anniuList[i];
            let clickHandler = new cc.Component.EventHandler();
            clickHandler.target = this.node;
            clickHandler.component = "Zhaojingzi";
            clickHandler.handler = "floorAnNiuClick";
            let button  = anniu_floor.addComponent(cc.Button);
            let name = anniu_floor.name;
            let num = name.substr(4,name.length-1);
            clickHandler.customEventData = num;
            button.clickEvents.push(clickHandler);
        }
    }
    
    floorAnNiuClick(e : cc.Event.EventTouch , num : number){
        if(!this.isBigger){
            return;
        }
        this.isChooseFloor = true;
        AudioService.Instance.playEffect("elevatorbtn",false);
        let anniu = e.target;
        anniu.removeComponent(cc.Button);
        let clicked = anniu.getChildByName("clicked");
        clicked.active = true;
        if(this.dianTiMoveNum == 0){
            this.dianTiMoveNum = num;
        }
        if(Number(num) < this.dianTiMoveNum){
            this.dianTiMoveNum = num;
        }
    }
    
    meinvClick(e : cc.Event.EventTouch , name : string){
        switch(name){
            case "meinv":
                this.becomeSmall();
                this.showLevelResult(false,3,"这熟悉的手感...");
                AudioService.Instance.playEffect("slap",false);
                break;
            case "xiaomei": 
                GameInfo.Instance.unlockAchieved(this.levelNum, 1,false);
                this.showLevelResult(false,2,"恋人未满");
                AudioService.Instance.playEffect("mistspray",false);
                break;
        }
    }
    
    getShadowProp(e : cc.Event.EventTouch){
        let prop = e.target
        let self = this;
        if(PropBar.Instance.propExist(prop)){
            return; 
        }
        prop.removeComponent(cc.Button);
        PropBar.Instance.addProp(prop, ()=>{
            let drag: DragBox = prop.getComponent(DragBox);
            drag.node.removeComponent(cc.Button);//移除按钮事件
            drag.setInitPos(prop.getPosition());//一定要设置新的初始位置
            drag.dragabled = true;//设置组件可拖拽
            //GameInfo.isGetShadowProp = true;
            cc.sys.localStorage.setItem(GameInfo.GAME_SHADOW, true);
            GameInfo.Instance.unlockLevel(24);
        });
    }

    jiaodaiClick(e : cc.Event.EventTouch){
        let jiaodai = e.target;
        jiaodai.removeComponent(cc.Button);
        jiaodai.active = false;
        this.jiaodaiFadeCount ++;
        if(this.jiaodaiFadeCount == this.jiaodaiCount){
            this.haibaoFade();
        }
    }

    haibaoFade(){
        var fade = cc.fadeOut(1.5);
        this.haibao.node.runAction(cc.sequence(fade,
            cc.callFunc(function(){
                 this.meiNvMove();
            },this)
        ));
    }

    meiNvMove(){
        this.daoying.node.active = true;
        this.meinv.node.parent = this.scene_2;
        this.daoying.node.parent = this.jingzi.node.getChildByName("jingmian");
        let anim = this.meinv.getComponent(cc.Animation);
        anim.play("meinvMove");
        let anim_daoying = this.daoying.getComponent(cc.Animation);
        anim_daoying.play("daoyingMove");
    }


    
    changebigger(e : cc.Event.EventTouch){
        this.isBigger = true;
        let anniuban = e.target;
        let cameraNode = cc.find("Main Camera",cc.Canvas.instance.node);
        let camera = cameraNode.getComponent(cc.Camera);
        camera.zoomRatio = 2.5;
        cameraNode.setPosition(anniuban.getPosition());
    }
    
    changesmall(e : cc.Event.EventTouch){
        this.isBigger = false;
        let changeSmall = e.target;
        this.becomeSmall();
        if(this.isChooseFloor){
            changeSmall.removeComponent(cc.Button);
            this.anniu.parent.removeComponent(cc.Button);
            this.floorMove();
        }
    }
    
    becomeSmall(){
        let cameraNode = cc.find("Main Camera",cc.Canvas.instance.node);
        let camera = cameraNode.getComponent(cc.Camera);
        camera.zoomRatio = 1;
        cameraNode.setPosition(cc.v2(0,0));
    }

    floorMove(){
        this.changePlayerEvent();
        let floorNum = this.floorTip.getChildByName("floorNum");
        this.schedule(function(){
            floorNum.getComponent(cc.Label).string = this.currentFloor + "";
            if(this.currentFloor == this.dianTiMoveNum){
                 this.diantimove();
            }
            this.currentFloor ++;
            
        }.bind(this),0.1,this.dianTiMoveNum -1,1);
    }

    diantimove(){
        AudioService.Instance.playEffect("电梯开门",false);
        var doorLeftAnim=this.door_left.getComponent(cc.Animation);
        var doorLeftAnimState=doorLeftAnim.play('left');
        var doorRightAnim=this.door_right.getComponent(cc.Animation);
        var doorRightAnimState=doorRightAnim.play('right');
        doorRightAnim.on('finished',this.tongguan,this);
    }

    tongguan(){
        let isSuccessDK = ( this.dianTiMoveNum == 18);
        if(isSuccessDK){
            let anim_abin = this.abin.getComponent(cc.Animation);
            anim_abin.play("abinMove");
            anim_abin.on("finished",function(){
                this.showLevelResult(true ,0,"妇女之友");
            },this);
        }else{
            if(this.dianTiMoveNum == 14){
                this.showLevelResult(false,5,"游戏《树灵》了解一下？");
            }else if(this.dianTiMoveNum == 8){
                this.showLevelResult(false,4,"来《放风》放放风？");
            }else{
                this.showLevelResult(false ,0,"你咋又双叒叕来了");
            }
            //this.showLevelResult(false ,1,"你咋又双叒叕来了");
        }
    }

    
}
