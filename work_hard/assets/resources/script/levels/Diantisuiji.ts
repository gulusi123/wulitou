import BaseLevel from "../common/BaseLevel";
import PropBar from "../common/PropBar";
import DragBox from "../common/DragBox";
import AudioService from "../common/AudioService";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Diantisuiji extends BaseLevel {
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
    
    //===== time ====
    private hour : number = 8;
    private mimute : number = 58;
    private second : number = 0;
    
    private isChooseFloor = false;
    private isSuccessDk = false;
    private isDoorOpen = false;
    private isTouch = true;
    private isMoveEnd = false;
    private gameEnd = false;
    private floorNum = [1,2,4,18,6,8,18,10,12,14,16,18,20];
    
    onLoad () {
        
        let wall = cc.find("scene/scene_1/dt-waimian", this.node);
        wall.y=this.Mask.y;
        
        this.initPageInfo(1,1);
        this.loadTarget(this.abin.node);
        this.bindTouchEvent();
        this.timeChange();
        this.getInitMoveNum();
        this.randomFloorClick(this.dianTiMoveNum,"open");
    }

    getInitMoveNum(){
        this.dianTiMoveNum = this.floorNum[Math.floor(Math.random()*this.floorNum.length)];
        if(this.dianTiMoveNum == 18){
            this.getInitMoveNum();
        }
    }
    
    bindTouchEvent(){
        let self = this;
        this.node.on(cc.Node.EventType.TOUCH_START, function(){
            self.isTouch = false;
        }, this);
        this.node.on(cc.Node.EventType.TOUCH_END,function(){
            self.isTouch = true;
        }, this);
        
    }

    timeChange(){
        this.schedule(function(){
            if(this.hour == 9 && !this.isSuccessDK){
                this.unscheduleAllCallbacks();
                this.isTouch = true;
                this.showLevelResult(false, 0, "你在电梯里迷路了？");
                // if(!this.isPlayerEvent()){
                // }
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
    
    randomFloorClick(number : number ,deal : string){
        let child = this.anniu.children;
        for(let i = 0 ; i < child.length ; i ++){
            if(child[i].name == "num-" + number){
                if(deal == "open"){
                    child[i].getChildByName("clicked").active = true;
                    this.floorMove();
                }else{
                    child[i].getChildByName("clicked").active = false;
                }
            }
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
        if(this.dianTiMoveNum > floorNumber){
            this.direction.node.angle = 180;
        }else if(this.dianTiMoveNum < floorNumber){
            this.direction.node.angle = 0;
        }else {
            this.diantimove();
            return;
        }
        let repeat = up?this.dianTiMoveNum - this.currentFloor : this.currentFloor-this.dianTiMoveNum;
        this.schedule(function(){
            floorNum.getComponent(cc.Label).string = this.currentFloor + "";
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
        doorLeftAnimState.wrapMode = cc.WrapMode.Normal;
        var doorRightAnim=this.door_right.getComponent(cc.Animation);
        var doorRightAnimState=doorRightAnim.play('right');
        doorRightAnimState.wrapMode = cc.WrapMode.Normal;
        doorRightAnim.on('finished',function(){
            doorRightAnim.off("finished");
            this.randomFloorClick(this.dianTiMoveNum,"close");
            this.isDoorOpen = true;
            this.diantiClose();
        }.bind(this));
    }
    
    diantiClose(){
        this.scheduleOnce(function(){
            if(this.isMoveEnd){
                return;
            }
            this.isDoorOpen = false;
            var doorLeftAnim=this.door_left.getComponent(cc.Animation);
            var doorLeftAnimState=doorLeftAnim.play('left');
            doorLeftAnimState.wrapMode = cc.WrapMode.Reverse;
            var doorRightAnim=this.door_right.getComponent(cc.Animation);
            var doorRightAnimState=doorRightAnim.play('right');
            doorRightAnimState.wrapMode = cc.WrapMode.Reverse;
            doorRightAnim.on('finished',function(){
                doorRightAnim.off("finished");
                this.dianTiMoveNum = this.floorNum[Math.floor(Math.random()*this.floorNum.length)];
                this.randomFloorClick(this.dianTiMoveNum,"open");
            }.bind(this));
        }.bind(this),4);
    }

    abinMove(){
        if(this.abin.node.y >= -48){
            this.isMoveEnd = true;
            this.gameEnd = true;
            if(this.dianTiMoveNum == 18){
                this.showLevelResult(true,0,"你真细·精！");
            }else{
                if(this.dianTiMoveNum == 14){
                    this.showLevelResult(false,2,"游戏《树灵》了解一下？");
                }else if(this.dianTiMoveNum == 8){
                    this.showLevelResult(false,1,"来《放风》放放风？");
                }else{
                    this.showLevelResult(false,0,"你是来面试的吗？");
                }
            }
        }else{
            if(this.isDoorOpen && this.isTouch){
                this.abin.node.y = this.abin.node.y + 3 ;
                this.abin.node.x = this.abin.node.x + 2; 
            }  
        }
    }

    update(){
        if(!this.gameEnd){
            this.abinMove();
        }
    }
}
