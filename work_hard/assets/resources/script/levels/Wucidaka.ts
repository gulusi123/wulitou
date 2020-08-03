import BaseLevel from "../common/BaseLevel";
import PropBar from "../common/PropBar";
import DragBox from "../common/DragBox";
import AudioService from "../common/AudioService";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Wucidaka extends BaseLevel {

    @property(cc.Node)
    abin: cc.Node = null;
    @property(cc.Node)
    door: cc.Node = null;
    @property(cc.Integer)
    timeOutNum : Number = 30;
    @property(cc.Integer)
    clickCount : Number = 5;
    @property(cc.SpriteFrame)
    normalHand : cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    clickHand : cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    timeNum : Array<cc.SpriteFrame> = [];

    @property(cc.Node)
    time : cc.Node = null;
    @property(cc.Label)
    keyError : cc.Label = null;
    private static TEXT = {
        Win: "论持久的重要性",
        TimeOut :"又愣着干啥",
        Dkj: "论持久的重要性"
    }
    
    //打卡次数,默认0
    private  dakaNum = 0;
    //打卡机界面是否方法,仅方法过程中可打卡
    private isBigger = false;
    //abin是否被点击移动
    private isMoveClick = false;
    private isMoveEnd = false;
    private isSuccessDK = false;

    private hour : number = 8;
    private mimute : number = 59;
    private second : number = 30;

    onLoad () {
        let nodes = this.sceneNode.children;
        for(let i=0; i<nodes.length; i++){
            nodes[i].x = i * cc.winSize.width;
            nodes[i].y = 0;
        }

        //动态设置背景墙的高度
        let wall = cc.find("background/wall", this.node);
        wall.height = cc.winSize.height/2;
        
        this.initPageInfo(1, 1);
        this.loadTarget(this.abin);
        this.setTimeOutEvent;
        this.timeChange();
        
        this.keyError.getComponent(cc.Label).string = "";
	} 

    timeChange(){
        this.schedule(function(){
            if(this.hour == 9 && !this.isSuccessDK){
                if(!this.isPlayerEvent()){
                    this.showLevelResult(false, 2, Wucidaka.TEXT.TimeOut);
                }else if(this.dakaNum < this.clickCount){
                    this.showLevelResult(false, 2, Wucidaka.TEXT.TimeOut);
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
                = this.timeNum[this.hour];
            this.time.getChildByName("minute1").getComponent(cc.Sprite).spriteFrame
                = this.timeNum[Math.floor(this.mimute/10)];
            this.time.getChildByName("minute2").getComponent(cc.Sprite).spriteFrame 
                = this.timeNum[this.mimute%10];
            this.time.getChildByName("second1").getComponent(cc.Sprite).spriteFrame 
                = this.timeNum[Math.floor(this.second/10)];
            this.time.getChildByName("second2").getComponent(cc.Sprite).spriteFrame
                = this.timeNum[this.second%10];
           
        }.bind(this),1,30,0);
    }

    setTimeOutEvent(){
        //操作超时
        let self = this;
        this.scheduleOnce(function (){
            if(!self.isSuccessDK){
                var anim = self.time.getComponent(cc.Animation);
                anim.play("timeChange");
                anim.on("finished",function(){
                    self.changesmall();
                    if(!self.isPlayerEvent()){
                        self.showLevelResult(false, 2, Wucidaka.TEXT.TimeOut);
                    }else if(self.dakaNum < self.clickCount){
                        self.showLevelResult(false, 2, Wucidaka.TEXT.TimeOut);
                    }
                });
            }
        },30);
    }
	
    /**
     * 开门
     */
    openDoor(){
        let self = this;
        AudioService.Instance.playEffect("自动门打开",false);
        let doorLeft = cc.find("mask/door_left", this.door);
        let doorRight = cc.find("mask/door_right", this.door);
        let leftAnim = doorLeft.getComponent(cc.Animation);
        let rightAnim = doorRight.getComponent(cc.Animation);
        leftAnim.play("door_left");
        rightAnim.play("door_right");
        leftAnim.on("finished", function(){
            self.showLevelResult(true, 1, Wucidaka.TEXT.Win);
        });
    }
    
    //点击打卡机
    dkj_Click(e: cc.Event.EventTouch){
        if(!this.isMoveClick){
            this.abinMove();
        }
        // else{
        //     if(this.isBigger == false){
        //         this.changebigger();
        //     }
        // }
    }
    
    buttonClick(e: cc.Event.EventTouch){
        this.dakaNum = 0;
        if(!this.isMoveClick){
            this.abinMove();
        }else if(this.isMoveEnd){
            AudioService.Instance.playEffect("dakaFail",false);
            this.dakaTips("密码错误");
        //    if(this.isBigger){
        //    }else{
        //        this.changebigger();
        //    }
        }
    }
    
    dakaTips(str){
        this.time.active = false;
        let self = this;
        let keyError = this.keyError;
        keyError.getComponent(cc.Label).string = str;
        let errorTipAnim = this.keyError.getComponent(cc.Animation);
        errorTipAnim.play("tipsAnim");
        errorTipAnim.on("finished",function(){
            self.time.active = true;
            keyError.getComponent(cc.Label).string = "";
        });
    }

    abinMove(){
        this.isMoveClick = true;
        let animAbin = null;
        let self = this;
        animAbin = this.abin.getComponent(cc.Animation);
        animAbin.play("abin_daka");
        animAbin.on("finished",function(){
            self.changePlayerEvent();
            let abin = self.node.getChildByName("abin");
            let hand = abin.getChildByName("hand");
            hand.getComponent(cc.Sprite).spriteFrame = self.clickHand;
            self.isMoveEnd = true;
            animAbin.off("finished");
        });
    }
    
    //点击打卡
    daka(e : cc.Event.EventTouch){
        let click = e.target;
        let self = this;
        let abinClick = self.abin.getComponent(cc.Animation);
        if(this.isSuccessDK || !this.isMoveEnd){
            return;
        }else{
            click.getComponent(cc.Button).interactable = false;
            abinClick.play("abinClick");
            abinClick.on("finished",function(){
                click.getComponent(cc.Button).interactable = true;
                abinClick.off("finished");
                self.dakaNum ++;
                //打卡五次,成功打卡
                if(self.dakaNum == self.clickCount){
                    self.isSuccessDK = true;
                    self.dakaTips("打卡成功");
                    self.changesmall();
                    self.scheduleOnce(function(){
                        let abin = self.node.getChildByName("abin");
                        let hand = abin.getChildByName("hand");
                        hand.getComponent(cc.Sprite).spriteFrame = self.normalHand;
                        let anim = self.abin.getComponent(cc.Animation);
                        anim.play("abinMove");
                            anim.on("finished",function(){
                            self.openDoor();
                        }.bind(self));
                    }.bind(self),1);
                }else{
                    AudioService.Instance.playEffect("dakaFail",false);
                    self.dakaTips("指纹不全");
                }
            });
        }
    }
 
    changebigger(){
        let cameraNode = cc.find("Main Camera",cc.Canvas.instance.node);
        let camera = cameraNode.getComponent(cc.Camera);
        camera.zoomRatio = 2.5;
        let dkj = this.node.getChildByName("scene").getChildByName("scene_1").getChildByName("dkj");
        cameraNode.setPosition(dkj.getPosition());
        this.isBigger = true;
    }
    
    changesmall(){
        this.dakaNum = 0;
        this.isBigger = false;
        let cameraNode = cc.find("Main Camera",cc.Canvas.instance.node);
        let camera = cameraNode.getComponent(cc.Camera);
        camera.zoomRatio = 1;
        cameraNode.setPosition(cc.v2(0,0));
    }

}
