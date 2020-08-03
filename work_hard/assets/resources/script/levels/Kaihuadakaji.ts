import BaseLevel from "../common/BaseLevel";
import PropBar from "../common/PropBar";
import DragBox from "../common/DragBox";
import GameInfo from "../common/GameInfo";
import AudioService from "../common/AudioService";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Kaihuadakaji extends BaseLevel {

    @property(cc.Node)
    abin: cc.Node = null;
    @property(cc.Node)
    door: cc.Node = null;
    @property(cc.SpriteAtlas)
    levelAtlas: cc.SpriteAtlas = null;
    onLoad () {
        let nodes = this.sceneNode.children;
        for(let i=0; i<nodes.length; i++){
            nodes[i].x = i * cc.winSize.width;
            nodes[i].y = 0;
        }

        //动态设置背景墙的高度
        let wall = cc.find("background/wall", this.node);
        wall.height = cc.winSize.height/2;

        //大鹏位于屏幕左侧外面
        let dapeng = cc.find("scene/scene_1/dapeng", this.node);
        dapeng.setPosition(-cc.winSize.width/2 - dapeng.width/2, dapeng.y);
        
        this.initPageInfo(2, 3);
        this.loadTarget(this.abin);
	}

    start () {

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
        leftAnim.on("finished", ()=>{
            self.showLevelResult(true, 1, "我想开了");
        });
    }
    buttonClick(e: cc.Event.EventTouch, data: string){
        let node: cc.Node = e.target;
        node.removeComponent(cc.Button);
        let self = this;
        if(data == "dkj1"){
            //大鹏拦路
            this.changePlayerEvent();
            let dapeng = cc.find("scene/scene_1/dapeng", this.node);
            let pos1 = node.parent.convertToWorldSpaceAR(node.getPosition());
            let pos2 = this.abin.parent.convertToWorldSpaceAR(this.abin.getPosition());
            let abinPos = cc.v2(this.abin.x + (pos1.x - pos2.x) - this.abin.width, this.abin.y + (pos1.y-pos2.y) - this.abin.height);
            let dapengPos = cc.v2(node.x, dapeng.y);
            cc.tween(this.abin).to(1, {position: abinPos}).start();
            cc.tween(dapeng).to(1, {position: dapengPos}).call(()=>{
                let time = cc.find("scene/scene_1/dkj/time",self.node);
                let hour = time.getChildByName("hour");
                let minute1 = time.getChildByName("minute1");
                let minute2 = time.getChildByName("minute2");
                hour.getComponent(cc.Sprite).spriteFrame = self.levelAtlas.getSpriteFrame("sz-dkj-9")
                minute1.getComponent(cc.Sprite).spriteFrame = self.levelAtlas.getSpriteFrame("sz-dkj-0")
                minute2.getComponent(cc.Sprite).spriteFrame = self.levelAtlas.getSpriteFrame("sz-dkj-0")
                self.scheduleOnce(function(){
                    self.showLevelResult(false, 4, "“死对头”");
                },0.5);
            }).start();
        }else if(data == "dkj2"){
            //打卡机坏了
            this.changePlayerEvent();
            let pos1 = node.parent.convertToWorldSpaceAR(node.getPosition());
            let pos2 = this.abin.parent.convertToWorldSpaceAR(this.abin.getPosition());
            let abinPos = cc.v2(this.abin.x + (pos1.x - pos2.x) - this.abin.width, this.abin.y + (pos1.y-pos2.y) - this.abin.height);
            cc.tween(this.abin)
            .to(1, {position: abinPos})
            .call(()=>{
                //node.getComponent(cc.Sprite).spriteFrame = self.levelAtlas.getSpriteFrame("dkj-huai");
                self.scheduleOnce(function(){
                    self.showLevelResult(false, 2, "该配眼镜了");
                }.bind(self),0.5)
            }).start();
        }
    }
    propClick(e: cc.Event.EventTouch, data: string){
        let prop = e.target;
        if(PropBar.Instance.propExist(prop)){
            return; 
        }
        let self = this;
        PropBar.Instance.addProp(prop, ()=>{
            let drag: DragBox = prop.getComponent(DragBox);
            
            drag.setInitPos(prop.getPosition());//一定要设置新的初始位置
            drag.dragabled = true;//设置组件可拖拽
            drag.setReceiveCallback(self.dragReceiver.bind(self));//绑定拖拽回调
        });
    }
    dragReceiver(drag: DragBox, receiver: cc.Collider){
        let self = this;
        if(drag.tag == 1 && receiver.tag == 2){
            //花盆接收种子
            PropBar.Instance.removeProp(drag.node);
            drag.node.parent = receiver.node;
            drag.node.setPosition(0, 20);
            drag.dragabled = false;
        }else if(drag.tag == 2 && receiver.tag == 1){
            receiver.node.removeComponent(cc.Button);
            //打卡机接收水杯
            PropBar.Instance.removeProp(drag.node, true);
            //触电失败
            let dkj_dw_dian = receiver.node.getChildByName("dkj-dw-dian");
            dkj_dw_dian.active = true;
            AudioService.Instance.playEffect("electric",false);
            let anim = dkj_dw_dian.getComponent(cc.Animation);
            anim.on("finished", function(){
                GameInfo.Instance.unlockAchieved(self.levelNum, 1,false);
                self.showLevelResult(false, 3, "触电的感觉");
            });
            let animState = anim.play("dkj_dw_dian");
            animState.wrapMode = cc.WrapMode.Loop;
            animState.repeatCount = 2;
        }else if(drag.tag == 2 && receiver.tag == 2){
            //花盆接收水杯
            //隐藏种子
            let zhongzi = receiver.node.getChildByName("zhongzi");
            if(zhongzi == null){
                //种子没有放上时，水杯浇水无用
                drag.returnInitPos();
                return;
            }
            AudioService.Instance.playEffect("labber",false);
            PropBar.Instance.removeProp(drag.node, true);
            zhongzi.active = false;
            //在即将执行时才判断玩家事件
            if(this.isPlayerEvent()){
                return;
            }
            this.changePlayerEvent();
            
            //长出打卡机
            let dkj_cao = receiver.node.getChildByName("dkj-cao")
            dkj_cao.active = true;
            let anim = dkj_cao.getComponent(cc.Animation);
            anim.on("finished", ()=>{
                //长出打卡机后给打卡机添加点击事件
                let btn = dkj_cao.getComponent(cc.Button);
                let btnEvent = new cc.Component.EventHandler();
                btnEvent.target = self.node;
                btnEvent.component = "Kaihuadakaji";
                
                btnEvent.handler = "dkj_cao_Click";
                btn.clickEvents.push(btnEvent);
                self.changePlayerEvent();
            });
            let animState = anim.play("dkj_cao");
        }else{
            drag.returnInitPos();
        }
    }

    /**
     * 长出打卡机点击事件
     */
    dkj_cao_Click(e: cc.Event.EventTouch) {
        if(this.isPlayerEvent()){
            return;
        }
        this.changePlayerEvent();
        //e.target.removeComponent(cc.Button);
        let anim = this.abin.getComponent(cc.Animation);
        let self = this;
        anim.on("finished", ()=>{
            self.openDoor();
        });
        anim.play("abin_cao_daka");
    }
}
