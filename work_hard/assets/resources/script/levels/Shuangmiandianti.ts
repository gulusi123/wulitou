import BaseLevel from "../common/BaseLevel";
import PropBar from "../common/PropBar";
import DragBox from "../common/DragBox";
import AudioService from "../common/AudioService";
import GameInfo from "../common/GameInfo";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Shuangmiandianti extends BaseLevel {
    @property(cc.Node)
    Mask:cc.Node=null;
    @property(cc.Node)
    anniu:cc.Node=null;
    @property(cc.Node)
    floorTip1 : cc.Node = null;
    @property(cc.Node)
    floorTip2: cc.Node = null;
    @property(cc.Node)
    mask1 : cc.Node = null;
    @property(cc.Node)
    mask2 : cc.Node = null;
    @property(cc.Sprite)
    abin : cc.Sprite = null;
    @property(cc.Prefab)
    rotate : cc.Prefab = null;

    private static TEXT = {
        Win: "我想开了",
        Dian: "触电的那种感觉慢慢出现",
        TimeOut : "上班时间到啦",
        JuZi: "磨刀不误砍柴功"
    }
    
    private dianTiMoveNum : number = 0;
    private currentFloor : number = 8;
    private isBigger = false;

    //===== time ====
    private hour : number = 8;
    private mimute : number = 58;
    private second : number = 0;
    
    private isChooseFloor = false;
    private isSuccessDk = false;
    private currentBtnAngle = 0;//(0:向下，-90向左,-180向上,-270向右)
    
    private rotateBtn : cc.Node = null;

    onLoad () {
        
        // let wall = cc.find("scene/scene_1/dt-waimian", this.node);
        // wall.y=this.Mask.y;
        
        this.initPageInfo(3,5);
        this.previousBtn.active = false;
        this.nextBtn.active = false;
        this.isRetry();
        this.bindClickHandler();
        this.loadTarget(this.abin.node);
        let beans = cc.find("scene/scene_2/beans",this.node);
        beans.setPosition(beans.x , - cc.winSize.height/2 + 100);
	}
    
    /**
     * 是否重玩
     */
    isRetry(){
        if(GameInfo._22isRetry){
            let rotateNode = cc.instantiate(this.rotate);
            rotateNode.parent = this.node;
            if(PropBar.Instance.propExist(rotateNode)){
                return; 
            }
            let self = this;
            PropBar.Instance.addProp(rotateNode, ()=>{
                let drag: DragBox = rotateNode.getComponent(DragBox);
                drag.node.removeComponent(cc.Button);//移除按钮事件
                drag.setInitPos(rotateNode.getPosition());//一定要设置新的初始位置
                drag.dragabled = true;//设置组件可拖拽
                drag.setReceiveCallback(self.dragReceiver.bind(self));//绑定拖拽回调
            });
        }
    }
    
    /**
     * 绑定电梯按钮事件
     */
    bindClickHandler(){
        let anniuList = this.anniu.children;
        
        let anniu_floor = null;
        for(let i = 0 ; i < anniuList.length ; i ++){
            anniu_floor = anniuList[i];
            let clickHandler = new cc.Component.EventHandler();
            clickHandler.target = this.node;
            clickHandler.component = "Shuangmiandianti";
            clickHandler.handler = "floorAnNiuClick";
            let button  = anniu_floor.addComponent(cc.Button);
            let name = anniu_floor.name;
            let num = name.substr(4,name.length-1);
            clickHandler.customEventData = num;
            button.clickEvents.push(clickHandler);
        }
    }
    
    /**
     * 电梯按钮点击事件
     * @param e 
     * @param num 
     */
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
    
    /**
     * 按钮点击事件
     * @param e 
     * @param str 
     */
    buttonClick(e : cc.Event.EventTouch , str : string){
        switch(str){
            case "door"://电梯门点击
                e.target.removeComponent(cc.Button);
                this.showLevelResult(false,0,"此门不开");
                break;
            case "rotate": //旋转角度
                let fanye = cc.find("scene/scene_2/other/qunyan-3L/fanye",this.node);
                fanye.angle -= 90;
                this.currentBtnAngle = fanye.angle;

                //回收旋转按钮到道具栏并取消点击事件
                let qunyan = cc.find("scene/scene_2/other/qunyan-3L",this.node);
                qunyan.removeComponent(cc.Button);
                
                let prop = this.rotateBtn;
                prop = this.rotateBtn;

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
                break;
            case "up":
                GameInfo._22isRetry = false;
                e.target.removeComponent(cc.Button);
                this.dianTiMoveNum = 20;
                this.floorMove();
                break;
            case "down":
                GameInfo._22isRetry = false;
                e.target.removeComponent(cc.Button);
                // this.dianTiMoveNum = 1;
                // this.floorMove();
                let scene_2 = cc.find("scene/scene_2",this.node);
                cc.tween(scene_2).to(1,{y : 100})
                .start();
                let beans = cc.find("scene/scene_2/beans",this.node);
                beans.getComponent(cc.Button).interactable = true;
                break;
            case "left":
                GameInfo._22isRetry = false;
                e.target.removeComponent(cc.Button);
                cc.find("scene/scene_0",this.node).setPosition(2880,0);
                cc.find("scene/scene_4",this.node).setPosition(0,0);
                this.previousScene(0.1);
                break;
            case "right":
                GameInfo._22isRetry = false;
                e.target.removeComponent(cc.Button);
                this.nextScene(0.1);
                break;
        }
    }
    
     /**
     * 上一场景
     */
    previousScene(time?:number){
        if(this.isPlayerEvent()){
            return;
        }
        this.changePlayerEvent();
        this.pageIndex -=2;
        let self = this;
        let action = cc.moveTo(time?time:0.5, cc.v2(-this.pageIndex * this.node.width, 0));
        let finish = cc.callFunc(()=>{
        
        });
        this.sceneNode.runAction(cc.sequence(action, finish));
    }

    /**
     * 下一场景
     */
    nextScene(time?:number){
        if(this.isPlayerEvent()){
            return;
        }
        this.changePlayerEvent();
        this.pageIndex += 2;
        let self = this;
        let action = cc.moveTo(time?time:0.5, cc.v2(-this.pageIndex * this.node.width, 0));
        let finish = cc.callFunc(()=>{

        });
        this.sceneNode.runAction(cc.sequence(action, finish));
    }
    
    /**
     * 
     * @param e 道具接收
     */
    prop_collect(e : cc.Event.EventTouch ){
        let prop = e.target
        if(PropBar.Instance.propExist(prop)){
            return; 
        }
        let self = this;
        PropBar.Instance.addProp(prop, ()=>{
            let drag: DragBox = prop.getComponent(DragBox);
            if(drag.propName == "按钮"){
                cc.find("scene/scene_2/other/qunyan-3L",this.node).removeComponent(cc.Button);
                self.startLead();
            }
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
        if(receiver.tag == 1 && tag_prop == 0){//阿斌和豆子
            PropBar.Instance.removeProp(drag.node);
            drag.dragabled = false;
            drag.node.active = false;
            GameInfo.Instance.unlockAchieved(this.levelNum, 1,false);
            this.showLevelResult(false,3,"阿斌：响屁不臭");
        }
        // else if(receiver.tag == 2 && tag_prop == 10){//路人和旋转按钮
        //     //克隆一个旋转按钮
        //     this.rotateBtn = cc.instantiate(drag.node);
        //     this.rotateBtn.parent = receiver.node;
        //     this.rotateBtn.setPosition(0,-30);

        //     PropBar.Instance.removeProp(drag.node);
        //     drag.dragabled = false;
        //     drag.node.destroy();
        //     this.bindRotateHandler();
        // }
        else if(receiver.tag == 3 && tag_prop == 1){//屏幕和按钮
            PropBar.Instance.removeProp(drag.node);
            drag.dragabled = false;
            drag.node.parent = receiver.node;
            drag.node.group = "receiver";
            drag.node.setPosition(-17,0);
            this.stopLead();
            this.bindBtnHandler();
        }else if(receiver.tag == 1 && tag_prop == 10){//按钮和旋转按钮
            this.changeAngle();
            drag.returnInitPos();
        }else{
            drag.returnInitPos();
        }
    }
    
    changeAngle(){
        let fanye = cc.find("scene/scene_2/btnReceiver/fanye",this.node);
        fanye.angle -= 90;
        this.currentBtnAngle = fanye.angle;
        this.bindBtnHandler();
    }


    /**
     * 按钮根据角度绑定点击事件
     */
    bindBtnHandler(){
        let fanye = cc.find("scene/scene_2/btnReceiver",this.node);
        fanye.removeComponent(cc.Button);
        let btn = fanye.addComponent(cc.Button);
        let clickHandler = new cc.Component.EventHandler();
        clickHandler.target = this.node;
        clickHandler.component = "Shuangmiandianti";
        clickHandler.handler = "buttonClick";
        let data = "";
        let yujiao = this.currentBtnAngle%360;
        if(yujiao == 0){
            data = "down";
        }else if(yujiao == -180){
            data = "up";
        }else if(yujiao == -90){
            data = "left";
        }else{
            data = "right";
        }
        clickHandler.customEventData = data;
        btn.clickEvents.push(clickHandler);
    }
    
    /**
     * 绑定旋转点击事件
     */
    bindRotateHandler(){
        let qunyan = cc.find("scene/scene_2/other/qunyan-3L",this.node);
        let btn = qunyan.addComponent(cc.Button);
        let clickHandler = new cc.Component.EventHandler();
        clickHandler.target = this.node;
        clickHandler.component = "Shuangmiandianti";
        clickHandler.handler = "buttonClick";
        clickHandler.customEventData = "rotate";
        btn.clickEvents.push(clickHandler);
    }
    
    /**
     * 楼层移动
     */
    floorMove(){
        this.changePlayerEvent();
        let floorNum1 = this.floorTip1.getChildByName("floorNum");
        let floorNum2 = this.floorTip2.getChildByName("floorNum");
        let floorNumber = (Number)(floorNum1.getComponent(cc.Label).string);
        let up = this.dianTiMoveNum > floorNumber;
        if(this.dianTiMoveNum > floorNumber){
            this.floorTip1.getChildByName("direction").angle = 180;
            this.floorTip2.getChildByName("direction").angle = 180;
        }else if(this.dianTiMoveNum < floorNumber){
            this.floorTip1.getChildByName("direction").angle = 0;
            this.floorTip2.getChildByName("direction").angle = 0;
        }else {
            this.diantimove();
            return;
        }
        let repeat = up?this.dianTiMoveNum - this.currentFloor : this.currentFloor-this.dianTiMoveNum;
        this.schedule(function(){
            floorNum1.getComponent(cc.Label).string = this.currentFloor + "";
            floorNum2.getComponent(cc.Label).string = this.currentFloor + "";
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
    
    /**
     * 开始引导
     */
    startLead(){
        let lead = cc.find("scene/scene_2/lead",this.node);
        let touchPoint = lead.getChildByName("touchPoint");
        let hand = lead.getChildByName("hand");
        lead.active = true;
        cc.tween(touchPoint)
            .repeat(10,
                cc.tween()
                .to(0.4,{scale : 1.3})
                .to(0.4,{scale : 1})
            )
            .start()
        cc.tween(hand)
            .repeat(10,
                cc.tween()
                .to(0.4,{scale : 1.3})
                .to(0.4,{scale : 1})
            )
            .start()
    }
    
    stopLead(){
        let lead = cc.find("scene/scene_2/lead",this.node);
        let touchPoint = lead.getChildByName("touchPoint");
        let hand = lead.getChildByName("hand");
        lead.active = false;
        touchPoint.stopAllActions();
        hand.stopAllActions();
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
    
    /**
     * 电梯开门
     */
    diantimove(){
        AudioService.Instance.playEffect("电梯开门",false);
        var doorLeftAnim1=this.mask1.getChildByName("door_left").getComponent(cc.Animation);
        var doorLeftAnimState=doorLeftAnim1.play('left');
        var doorRightAnim1=this.mask1.getChildByName("door_right").getComponent(cc.Animation);
        var doorRightAnimState=doorRightAnim1.play('right');

        var doorLeftAnim2=this.mask2.getChildByName("door_left").getComponent(cc.Animation);
        var doorLeftAnimState=doorLeftAnim2.play('left');
        var doorRightAnim2=this.mask2.getChildByName("door_right").getComponent(cc.Animation);
        var doorRightAnimState=doorRightAnim2.play('right');
        doorRightAnim1.on('finished',this.tongguan,this);
    }
    
    tongguan(){
        let isSuccessDK = ( this.dianTiMoveNum == 18);
        if(isSuccessDK && this.pageIndex !== 2){
            let anim_abin = this.abin.getComponent(cc.Animation);
            anim_abin.play("abinMove");
            anim_abin.on("finished",function(){
                this.showLevelResult(true ,0,"有一种关，可以重来~~");
            },this);
        }else{
            if(this.dianTiMoveNum == 14){
                this.showLevelResult(false,5,"游戏《树灵》了解一下？");
            }else if(this.dianTiMoveNum == 8){
                this.showLevelResult(false,4,"来《放风》放放风？");
            }else{
                this.showLevelResult(false ,0,"你咋又双叒叕来了");
            }
            //this.showLevelResult(false ,1,"打卡失败");
        }
    }
}
