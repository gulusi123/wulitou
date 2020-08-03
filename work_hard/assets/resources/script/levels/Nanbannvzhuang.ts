import BaseLevel from "../common/BaseLevel";
import PropBar from "../common/PropBar";
import DragBox from "../common/DragBox";
import GameInfo from "../common/GameInfo";
import AudioService from "../common/AudioService";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Nanbannvzhuang extends BaseLevel {

    @property(cc.SpriteAtlas)
    levelAtlas: cc.SpriteAtlas = null;
    @property(cc.Label)
    floor: cc.Label = null;
    @property(cc.Node)
    abin: cc.Node = null;
    @property(cc.Node)
    qunyan: cc.Node = null;
    @property(cc.Sprite)
    girl: cc.Sprite = null;

    private floorNum = 10;

    private isWait = false;
    private huazhuang = false;
    private yifu = false;
    private getYifu = false;
    onLoad () {
        //动态设置背景墙的高度
        let wall = cc.find("background/wall", this.node);
        wall.height = cc.winSize.height/2 - wall.y;

        this.initPageInfo(2, 3);
        this.floor.string = this.floorNum + "";
        this.initGuizi();
        this.loadTarget(this.abin);
	}

    start () {

    }

    downElevator() {
        let self = this;
        this.schedule(()=>{
            this.floorNum--;
            self.floor.string = this.floorNum + "";
            if(this.floorNum == 1){
                let zhishi = cc.find("zhishi", self.floor.node.parent);
                zhishi.angle = 180;
                let left = cc.find("scene/scene_2/dianti/mask/left", this.node);
                let right = cc.find("scene/scene_2/dianti/mask/right", this.node);
                cc.tween(left).to(1, {x: left.x - left.width}).call(()=>{
                    self.intoElevator();
                }).start();
                cc.tween(right).to(1, {x: right.x + right.width}).start();
            }
        }, 0.25, this.floorNum-2, 1);
    }
    closeDoor(){
        let self = this;
        let left = cc.find("scene/scene_2/dianti/mask/left", this.node);
        let right = cc.find("scene/scene_2/dianti/mask/right", this.node);
        cc.tween(left).to(1, {x: left.x + left.width}).call(()=>{
            if(self.huazhuang && self.yifu){
                self.showLevelResult(true, 1, "走女人的路，让女人无路可走");
            }else{
                self.showLevelResult(false, 2, "老实人");
            }
        }).start();
        cc.tween(right).to(1, {x: right.x - right.width}).start();
    }
    buttonClick(e: cc.Event.EventTouch, data: string){
        if(data == "paidui"){
            this.abinWait(e.target);
        }else if(data == "mv"){
            if(this.yifu){
                return;
            }
            e.target.removeComponent(cc.Button);
            GameInfo.Instance.unlockAchieved(this.levelNum, 1,false);
            this.showLevelResult(false, 4, "老娘也敢摸？");
            AudioService.Instance.playEffect("slap",false);
        }else if(data == "dh-ky"){
            e.target.removeComponent(cc.Button);
            this.girlJumpInline();
        }else if(data == "dh-bx"){
            e.target.removeComponent(cc.Button);
            GameInfo.Instance.unlockAchieved(this.levelNum, 1,false);
            this.showLevelResult(false, 4, "一个巴掌清脆响");
            AudioService.Instance.playEffect("slap",false);
        }
    }
    propClick(e: cc.Event.EventTouch, data: string){
        let prop: cc.Node = e.target;
        prop.removeComponent(cc.Button);//移除道具的按钮组件
        if(PropBar.Instance.propExist(prop)){
            return;
        }
        let self = this;
        PropBar.Instance.addProp(prop, ()=>{
            let drag: DragBox = prop.getComponent(DragBox);
            if(drag.propName == "女装"){
                self.getYifu = true;
            }
            drag.setInitPos(prop.getPosition());//一定要设置新的初始位置
            drag.dragabled = true;//设置组件可拖拽
            drag.setReceiveCallback(self.dragReceiver.bind(self));//绑定拖拽回调
        });
    }
    dragReceiver(drag: DragBox, receiver: cc.Collider){
        if(this.isWait){
            //排队中不能使用道具
            drag.returnInitPos();
            return;
        }
        PropBar.Instance.removeProp(drag.node, true);
        if(drag.tag == 1){
            if(this.yifu){
                receiver.node.children[0].active = false;
                receiver.node.getComponent(cc.Sprite).spriteFrame = this.levelAtlas.getSpriteFrame("rw-zj-bz2");
            }else{
                receiver.node.children[0].active = true;
            }
            this.huazhuang = true;
        }else if(drag.tag == 2){
            receiver.node.children[0].active = false;
            if(this.huazhuang){
                receiver.node.getComponent(cc.Sprite).spriteFrame = this.levelAtlas.getSpriteFrame("rw-zj-bz2");
            }else{
                receiver.node.getComponent(cc.Sprite).spriteFrame = this.levelAtlas.getSpriteFrame("rw-zj-bz1");
            }
            this.yifu = true;
        }
    }
    abinWait(target: cc.Node){
        this.changePlayerEvent();//阿斌排队后，禁止其他事件发生
        let self = this;
        this.isWait = true;
        target.removeComponent(cc.Button);
        this.girl.node.removeComponent(cc.Button);//排队后美女不能点击了
        this.abin.children[0].active = false;
        if(this.yifu){
            //换了衣服
            this.abin.getComponent(cc.Sprite).spriteFrame = this.levelAtlas.getSpriteFrame("rw-zj-bz-bm");
        }else{
            this.abin.getComponent(cc.Sprite).spriteFrame = this.levelAtlas.getSpriteFrame("rw-zj-beimian");
        }

        let pos1 = target.parent.convertToWorldSpaceAR(target.getPosition());
        let pos2 = this.abin.parent.convertToWorldSpaceAR(this.abin.getPosition());
        cc.tween(this.abin).to(1, {x: this.abin.x + (pos1.x-pos2.x) + 40, y: this.abin.y + (pos1.y-pos2.y) - 40}).call(()=>{
            if((!self.yifu && self.huazhuang) || (self.yifu && !self.huazhuang)){
                //只画装一样
                let resultNum = 32;
                let achievedNum = 2;
                if(self.yifu){
                    resultNum = 31;
                    achievedNum = 3;
                }
                GameInfo.Instance.unlockAchieved(this.levelNum, self.yifu?2:3 ,false);
                self.showLevelResult(false, resultNum, self.yifu?"怪大叔":"老娘的战衣呢");
            }else if(self.huazhuang && self.yifu){
                //都画了装美女只能排后面
                // self.downElevator();
                self.girlWait(false);
            }else if(!self.huazhuang && !self.yifu){
                //self.downElevator();
                self.girlWait(true);
            }
        }).start();
    }
    /** 
    girlWait(front: boolean){
        //先将girl放置到场景2
        this.girl.spriteFrame = this.levelAtlas.getSpriteFrame("rw-mn1");
        let qunyan = cc.find("scene/scene_2/qunyan", this.node);
        this.girl.node.x = cc.winSize.width/2 + this.girl.node.width/2;
        let self = this;
        let newPos = null;
        if(front){
            newPos = cc.v2(this.abin.x - 30, this.abin.y + 20);
            this.girl.node.parent = qunyan;
            this.abin.parent = qunyan;
        }else{
            //在后面将阿斌也放入qunyan
            this.abin.parent = qunyan;
            this.girl.node.parent = qunyan;
            newPos = cc.v2(this.abin.x + 30, this.abin.y - 40);
        }
       
        cc.tween(this.girl.node).to(1, {position: newPos}).call(()=>{
            self.girl.spriteFrame = self.levelAtlas.getSpriteFrame("rw-mn2");
        }).start();
    }
    */
   /**
    * 美女插队
    */
   girlJumpInline(){
        let girlDialog = cc.find("wenzipao", this.girl.node);
        let abinDialog = cc.find("wenzipao", this.abin);
        girlDialog.active = false;
        abinDialog.active = false;
        this.girl.spriteFrame = this.levelAtlas.getSpriteFrame("rw-mn2");
        let qunyan = cc.find("scene/scene_2/qunyan", this.node);
        let self = this;
        let newPos = null;
        newPos = cc.v2(this.abin.x - 30, this.abin.y + 20);
        this.girl.node.parent = qunyan;
        this.abin.parent = qunyan;
    
        cc.tween(this.girl.node).to(0.5, {position: newPos}).call(()=>{
            // self.girl.spriteFrame = self.levelAtlas.getSpriteFrame("rw-mn2");
            self.downElevator();
        }).start();
   }
   girlWait(front: boolean){
        //先将girl放置到场景2
        this.girl.spriteFrame = this.levelAtlas.getSpriteFrame("rw-mn1");
        let qunyan = cc.find("scene/scene_2/qunyan", this.node);
        this.girl.node.x = -cc.winSize.width/2 - this.girl.node.width/2;
        let self = this;
        let newPos = null;
        if(front){
            newPos = cc.v2(this.abin.x - 100, this.abin.y + 20);
            this.girl.node.parent = qunyan;
            this.abin.parent = qunyan;
            let girlDialog = cc.find("wenzipao", this.girl.node);
            let abinDialog = cc.find("wenzipao", this.abin);
            cc.tween(this.girl.node).to(1, {position: newPos}).call(()=>{
                // self.girl.spriteFrame = self.levelAtlas.getSpriteFrame("rw-mn2");
                self.scheduleOnce(()=>{
                    girlDialog.active = true;
                }, 0.2);
                self.scheduleOnce(()=>{
                    abinDialog.active = true;
                }, 0.8);
            }).start();
        }else{
            //在后面将阿斌也放入qunyan
            this.abin.parent = qunyan;
            this.girl.node.parent = qunyan;
            newPos = cc.v2(this.abin.x + 30, this.abin.y - 40);
            cc.tween(this.girl.node).to(1, {position: newPos}).call(()=>{
                self.girl.spriteFrame = self.levelAtlas.getSpriteFrame("rw-mn2");
                self.downElevator();
            }).start();
        }
    }
    intoElevator(){
        let qunyan: cc.Node[] = [];
        for(let n of this.qunyan.children){
            qunyan.push(n);
        }
        let diantiBody = cc.find("scene/scene_2/dianti/body", this.node);
        let pos: cc.Vec2[] = [cc.v2(-80, 80), cc.v2(60, 120), cc.v2(-120, 140), cc.v2(-60, 180), cc.v2(-30, 210), cc.v2(-120, 230), cc.v2(-80, 230)];
        if(this.yifu && this.huazhuang){
            pos[5].y += 20;
        }
        for(let i=0; i<qunyan.length; i++){
            cc.tween(qunyan[i]).to(1, {position: cc.v2(qunyan[i].x + pos[i].x, qunyan[i].y + pos[i].y)}).start();
        }
        let self = this;
        this.scheduleOnce(()=>{
            for(let i=0; i<qunyan.length; i++){
                let p = qunyan[i].parent.convertToWorldSpaceAR(qunyan[i].getPosition());
                qunyan[i].setPosition(diantiBody.convertToNodeSpaceAR(p));
                if(i < qunyan.length - 1){
                    //最后一个不进电梯
                    qunyan[i].parent = diantiBody;
                }
            }
            if(!self.yifu && !self.huazhuang){
                self.girl.spriteFrame = this.levelAtlas.getSpriteFrame("rw-mn1");
            }else if(self.yifu && self.huazhuang){
                self.abin.getComponent(cc.Sprite).spriteFrame = this.levelAtlas.getSpriteFrame("rw-zj-bz2");
            }
            self.scheduleOnce(self.closeDoor, 1);
        }, 1);
    }
    initGuizi(){
        let men = cc.find("scene/scene_3/zhiwugui/men", this.node);
        let nvzhuang = cc.find("scene/scene_3/zhiwugui/men/nvzhuang", this.node);
        //随机衣服的位置
        let index = Math.floor(Math.random() * 10);
        nvzhuang.setPosition(men.children[index].getPosition());
        for(let i=1; i<=9; i++){
            let btn = men.children[i].addComponent(cc.Button);
            let btnEvent = new cc.Component.EventHandler();
            btnEvent.target = this.node; 
            btnEvent.component = "Nanbannvzhuang";
            btnEvent.handler = "guiziClick";
            btnEvent.customEventData = i + "";
            btn.clickEvents.push(btnEvent);
        }
    }
    guiziClick(e: cc.Event.EventTouch, data: string){
        AudioService.Instance.playEffect("boxOpen",false);
        let index = Number(data);
        let men = cc.find("scene/scene_3/zhiwugui/men", this.node);
        e.target.active = false;
        if(!this.getYifu){
            men.children[index+9].active = true;
        }else{
            men.children[index+8].active = true;
        }
    }
}
