import BaseLevel from "../common/BaseLevel";
import PropBar from "../common/PropBar";
import DragBox from "../common/DragBox";
import AudioService from "../common/AudioService";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Diantijianfa extends BaseLevel {
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
    abin : cc.Sprite = null;
    @property(cc.Sprite)
    direction : cc.Sprite = null;

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
        
        this.initPageInfo(1,1);
        this.loadTarget(this.abin.node);
        //this.timeChange();
        this.bindClickHandler();
	}
    
    timeChange(){
        this.schedule(function(){
            if(this.hour == 9 && !this.isSuccessDK){
                if(!this.isPlayerEvent()){
                    this.changesmall();
                    this.showLevelResult(false, 0, Diantijianfa.TEXT.TimeOut);
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
            clickHandler.component = "Diantijianfa";
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
        let anniu = e.target;
        AudioService.Instance.playEffect("elevatorbtn",false);
        anniu.removeComponent(cc.Button);
        let clicked = anniu.getChildByName("clicked");
        clicked.active = true;
        if(this.dianTiMoveNum == 0){
            this.dianTiMoveNum = num;
        }
        if(this.dianTiMoveNum == 19){
           if(num == -1){
               this.dianTiMoveNum = 18
           }else if(Number(num) < this.dianTiMoveNum){
            this.dianTiMoveNum = num;
           }
        }else{
            if(this.dianTiMoveNum == 18){
                this.dianTiMoveNum = -1;
            }else if(Number(num) < this.dianTiMoveNum){
                this.dianTiMoveNum = num;
            }
        }
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
        let floorNumber = (Number)(floorNum.getComponent(cc.Label).string);
        let up = this.dianTiMoveNum > floorNumber;
        if(up){
            this.direction.node.angle = 180;
        }else{
            this.direction.node.angle = 0;
        } 
        let repeat = up?this.dianTiMoveNum - this.currentFloor : this.currentFloor-this.dianTiMoveNum;
        this.schedule(function(){
            if(this.currentFloor != 0){
                floorNum.getComponent(cc.Label).string = this.currentFloor + "";
            }
            if(this.currentFloor == this.dianTiMoveNum){
                 this.diantimove();
            }
            if(up){
                this.currentFloor ++;
            }else{
                this.currentFloor --;
            }
            
        }.bind(this),0.1,repeat,1);
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
                this.showLevelResult(true ,0,"机智boy");
            },this);
        }else{
            if(this.dianTiMoveNum == 13){
                this.showLevelResult(false,2,"游戏《树灵》了解一下？");
            }else if(this.dianTiMoveNum == 7){
                this.showLevelResult(false,1,"来《放风》放放风？");
            }else{
                this.showLevelResult(false,0,"你是来面试的吗？");
            }
        }
    }
}
