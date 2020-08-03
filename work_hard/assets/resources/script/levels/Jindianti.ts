import BaseLevel from "../common/BaseLevel";
import PropBar from "../common/PropBar";
import DragBox from "../common/DragBox";
import GameInfo from "../common/GameInfo";
import AudioService from "../common/AudioService";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Jindianti extends BaseLevel {

    @property(cc.Node)
    abin: cc.Node = null;
    @property(cc.Node)
    queue: cc.Node = null;
    @property(cc.Node)
    box : cc.Node = null;
    @property(cc.Node)
    phone : cc.Node = null;
    @property(cc.SpriteFrame)
    light_green : cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    wifiFull : cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    abin_paidui : cc.SpriteFrame = null;
    @property(cc.Label)
    floor: cc.Label = null;

    private floorNum = 5;

    private isWait = false;
    private huazhuang = false;
    private yifu = false;
    private getJiaodai = false;
    private wifiOk = false;
    private isGameEnd = false;

    private hour : number = 8;
    private mimute : number = 59;
    private second : number = 40;

    onLoad () {
        //动态设置背景墙的高度
        let wall = cc.find("background/wall", this.node);
        wall.height = cc.winSize.height/2 - wall.y;

        this.initPageInfo(1, 2);
        this.loadTarget(this.abin);
        this.timeChange();
        this.initGuizi();
	}

    start () {

    }
    
    timeChange(){
        this.schedule(function(){
            if(this.hour == 9 && !this.isGameEnd
                ){
                this.showLevelResult(false, 0, "时不待我");
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
           
        }.bind(this),1,20,0);
    }
    
    buttonClick(e: cc.Event.EventTouch, str: string){
        switch(str){
            case "jiaodai":
                let prop = e.target
                let self = this;
                if(PropBar.Instance.propExist(prop)){
                    return; 
                }
                this.getJiaodai = true;
                prop.removeComponent(cc.Button);
                PropBar.Instance.addProp(prop, ()=>{
                    let drag: DragBox = prop.getComponent(DragBox);
                    drag.node.removeComponent(cc.Button);//移除按钮事件
                    drag.setInitPos(prop.getPosition());//一定要设置新的初始位置
                    drag.dragabled = true;//设置组件可拖拽
                    drag.setReceiveCallback(self.dragReceiver.bind(self));//绑定拖拽回调
                });
                break;
            case  "open":
                this.changePlayerEvent();
                this.phone.active = true;
                this.abin.getChildByName("phone_button")
                .getComponent(cc.Button).interactable = false;
                break;
            case  "close":
                this.changePlayerEvent();
                this.phone.active = false;
                this.abin.getChildByName("phone_button")
                .getComponent(cc.Button).interactable = true;
                this.phone.getChildByName("telPhone").getChildByName("tip").active = false;
                this.phone.getChildByName("telPhone").getChildByName("tip1").active = false;
                break;
            case "queue":
                e.target.removeComponent(cc.Button);
                this.abinWait(e);
                break;
            case "up":
                e.target.removeComponent(cc.Button);
                this.upCallBack(e);
                break;
            case "dingding":
                this.dingdingCallBack(e);
                break;
        }
    }
    
    abinWait(e : cc.Event.EventTouch){
        this.changePlayerEvent();
        this.abin.getComponent(cc.Sprite).spriteFrame = this.abin_paidui;
        let target = e.target;
        this.transportParent(this.abin,target);
        
        cc.tween(this.abin).to(1, {x: 40,
             y: - 40})
            .call(this.queueCallBack.bind(this))
            .start();
    }
    
    queueCallBack(){
        //this.abin.getChildByName("phone_button").getComponent(cc.Button).interactable = false;
        let self = this;
        this.isGameEnd = true;
        this.scheduleOnce(function(){
            self.showLevelResult(false,0,"等到花儿都谢了");
        },0.5);
    }
    
    dingdingCallBack(e : cc.Event.EventTouch){
        if(this.wifiOk){
            this.phone.getChildByName("telPhone").getChildByName("tip1").active = true;
        }else{
            this.phone.getChildByName("telPhone").getChildByName("tip").active = true;
        }
    }
    
    upCallBack(e : cc.Event.EventTouch){
        let up = e.target;
        this.changePlayerEvent();
        this.isGameEnd = true;
        this.queue.removeComponent(cc.Button);
        up.getChildByName("green").active = true;
        this.downElevator();
    }
    
    downElevator() {
        let zhishi = cc.find("zhishi", this.floor.node.parent);
        let self = this;
        zhishi.active = true;
        cc.tween(this.abin).to(1,{x : this.abin.x + 100 , y : this.abin.y + 400})
        .call(()=>{
            self.openElevatorDoor();
        })
        .start();
    }
    
    openElevatorDoor(){
        let self = this;
        let left = cc.find("scene/scene_1/dianti/mask/left", this.node);
        let right = cc.find("scene/scene_1/dianti/mask/right", this.node);
        AudioService.Instance.playEffect("电梯开门",false);
        cc.tween(left).to(1, {x: left.x - left.width}).call(()=>{
        self.intoElevator();
        }).start();
        cc.tween(right).to(1, {x: right.x + right.width}).start();
    }

    intoElevator(){
        let qunyan = cc.find("scene/scene_1/queue/qunyan-2", this.node);
        let body = cc.find("scene/scene_1/dianti/body", this.node);
        this.transportParent(this.abin,body);
        this.transportParent(qunyan,body);
        let self = this;
        cc.tween(qunyan).to(1,{y : 160}).start(); 
        cc.tween(this.abin)
            .call(function(){
                self.abin.getComponent(cc.Sprite).spriteFrame = self.abin_paidui;
            })
            .to(1,{x : this.abin.x + 30,y : 155})
            .call(function(){
                self.scheduleOnce(self.closeDoor,0.5);
            }.bind(self))
            .start(); 
    }
    
    closeDoor(){
        let self = this;
        let left = cc.find("scene/scene_1/dianti/mask/left", this.node);
        let right = cc.find("scene/scene_1/dianti/mask/right", this.node);
        cc.tween(left).to(1, {x: left.x + left.width}).call(()=>{
                self.showLevelResult(true, 1, "低头族救星");
        }).start();
        cc.tween(right).to(1, {x: right.x - right.width}).start();
    }

    dragReceiver(drag: DragBox, receiver: cc.Collider){
        if(this.isWait){
            //排队中不能使用道具
            drag.returnInitPos();
            return;
        }
        PropBar.Instance.removeProp(drag.node, true);
        let tag = drag.tag;
        switch(tag){
            case 0 :
                this.wifiOk = true;
                this.box.getChildByName("line_break").active = false;
                this.box.getChildByName("line_join").active = true;
                this.box.getChildByName("lamp").getComponent(cc.Sprite).spriteFrame = this.light_green;
                this.phone.getChildByName("telPhone").getChildByName("sj-wifi").getComponent(cc.Sprite).spriteFrame = this.wifiFull;
                break;
        }
    }
     
    transportParent(current : cc.Node , newParent : cc.Node){
        let current_pos_world = current.convertToWorldSpaceAR(cc.v2(0,0));
        let current_queue_pos = newParent.convertToNodeSpaceAR(current_pos_world);
        current.parent = newParent;
        current.setPosition(current_queue_pos);
    }

    initGuizi(){
        let men = cc.find("scene/scene_2/zhiwugui/men", this.node);
        let jiaodai = cc.find("scene/scene_2/zhiwugui/men/jiaodai", this.node);
        let index = Math.floor(Math.random() * 10);
        jiaodai.setPosition(men.children[index].x,men.children[index].y - 10);
        for(let i=1; i<=9; i++){
            let btn = men.children[i].addComponent(cc.Button);
            let btnEvent = new cc.Component.EventHandler();
            btnEvent.target = this.node; 
            btnEvent.component = "Jindianti";
            btnEvent.handler = "guiziClick";
            btnEvent.customEventData = i + "";
            btn.clickEvents.push(btnEvent);
        }
    }

    guiziClick(e: cc.Event.EventTouch, data: string){
        AudioService.Instance.playEffect("boxOpen",false);
        let index = Number(data);
        let men = cc.find("scene/scene_2/zhiwugui/men", this.node);
        e.target.active = false;
        if(!this.getJiaodai){
            men.children[index+9].active = true;
        }else{
            men.children[index+8].active = true;
        }
    }
}
