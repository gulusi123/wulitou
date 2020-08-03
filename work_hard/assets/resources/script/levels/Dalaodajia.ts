import BaseLevel from "../common/BaseLevel";
import PropBar from "../common/PropBar";
import DragBox from "../common/DragBox";
import GameInfo from "../common/GameInfo";
import AudioService from "../common/AudioService";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Dalaodajia extends BaseLevel {

    @property(cc.SpriteAtlas)
    levelAtlas: cc.SpriteAtlas = null;
    @property(cc.SpriteAtlas)
    otherAtlas: cc.SpriteAtlas = null;
    @property(cc.Label)
    floor: cc.Label = null;
    @property(cc.Node)
    abin: cc.Node = null;
    @property(cc.Node)
    qunyan: cc.Node = null;
    @property(cc.Sprite)
    girl: cc.Sprite = null;
    @property(cc.SpriteFrame)
    abinSmile : cc.SpriteFrame = null;

    private floorNum = 10;

    private isWait = false;
    private yifu = false;

    private canChange = false;
    private changeIndex = 5;
    private getYifu = false;
    onLoad () {
        //动态设置背景墙的高度
        let wall = cc.find("background/wall", this.node);
        wall.height = cc.winSize.height/2 - wall.y;

        this.initPageInfo(2, 3);
        this.loadTarget(this.abin);
        this.floor.string = this.floorNum + "";
        this.initGuizi();
	}

    start () {

    }

    /**
     * 电梯下降
     */
    downElevator(isWin: boolean) {
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
                    if(isWin){
                        //电梯下降完成后，可点击电梯
                        let dianti = cc.find("scene/scene_2/dianti/body", self.node);
                        dianti.getComponent(cc.Button).interactable = true;
                    }else{
                        //人群进入电梯
                        self.intoElevator();
                    }
                }).start();
                cc.tween(right).to(1, {x: right.x + right.width}).start();
            }
        }, 0.25, this.floorNum-2, 1);
    }
    closeDoor(isWin: boolean){
        let self = this;
        let left = cc.find("scene/scene_2/dianti/mask/left", this.node);
        let right = cc.find("scene/scene_2/dianti/mask/right", this.node);
        cc.tween(left).to(1, {x: left.x + left.width}).call(()=>{
            if(isWin){
                self.showLevelResult(true, 1, "美人计，Yes!");
            }else{
                self.showLevelResult(false, 0, "为什么又是我？");
            }
        }).start();
        cc.tween(right).to(1, {x: right.x - right.width}).start();
    }
    buttonClick(e: cc.Event.EventTouch, data: string){
        if(data == "paidui"){
            this.abinWait(e.target);
        }else if(data == "dl"){
            if(this.yifu){
                GameInfo.Instance.unlockAchieved(this.levelNum, 2,false);
                this.showLevelResult(false, 3, "基情百分百！");
            }else{
                GameInfo.Instance.unlockAchieved(this.levelNum, 1,false);
                this.showLevelResult(false, 2, "老子也敢惹！");
            }
        }else if(data == "dt"){
            e.target.removeComponent(cc.Button);
            this.abinIntoElevator(e.target);
        }
    }
    propClick(e: cc.Event.EventTouch, data: string){
        let prop: cc.Node = e.target;
        prop.removeComponent(cc.Button);//移除道具的按钮组件
        if(PropBar.Instance.propExist(prop)){
            return;
        }
        if(data == "mv"){
            prop.getComponent(cc.Sprite).spriteFrame = this.levelAtlas.getSpriteFrame("rw-mn-tx");
        }else if(data == "yf"){
            this.getYifu = true;
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
        if(this.isWait){
            //排队中不能使用道具
            drag.returnInitPos();
            return;
        }
        if(drag.tag == 2 && receiver.tag == 1){
            PropBar.Instance.removeProp(drag.node, true);
            receiver.node.getComponent(cc.Sprite).spriteFrame = this.otherAtlas.getSpriteFrame("rw-zj-bz1");
            this.yifu = true;
        }else if(drag.tag == 3 && receiver.tag == 3){
            this.changePlayerEvent();//改变事件状态，禁止其他事件发生
            //移除两个大佬的点击事件
            let dl1 = cc.find("scene/scene_1/shafa-2/rw-dl1", this.node);
            let dl2 = cc.find("scene/scene_1/shafa-2/rw-dl2", this.node);
            dl1.removeComponent(cc.Button);
            dl2.removeComponent(cc.Button);

            PropBar.Instance.removeProp(drag.node, false);
            drag.node.getComponent(cc.Sprite).spriteFrame = this.otherAtlas.getSpriteFrame("rw-mn1");
            drag.node.setPosition(-4, 0);
            drag.node.parent = receiver.node;
            this.moveToGril(drag.node);
        }
    }
    abinWait(target: cc.Node){
        this.changePlayerEvent();//阿斌排队后，禁止其他事件发生
        let self = this;
        this.isWait = true;
        target.removeComponent(cc.Button);
        this.girl.node.removeComponent(cc.Button);//排队后美女不能点击了
        if(this.yifu){
            //换了衣服
            this.abin.getComponent(cc.Sprite).spriteFrame = this.otherAtlas.getSpriteFrame("rw-zj-bz-bm");
        }else{
            this.abin.getComponent(cc.Sprite).spriteFrame = this.otherAtlas.getSpriteFrame("rw-zj-beimian");
        }

        let pos1 = target.parent.convertToWorldSpaceAR(target.getPosition());
        let pos2 = this.abin.parent.convertToWorldSpaceAR(this.abin.getPosition());
        cc.tween(this.abin).to(1, {x: this.abin.x + (pos1.x-pos2.x) + 40, y: this.abin.y + (pos1.y-pos2.y) - 40}).call(()=>{
            if(self.yifu){
                self.showLevelResult(false, 4, "霉人记");
            }else{
                //将阿斌放入qunyan子节点
                let qunyan = cc.find("scene/scene_2/qunyan", self.node);
                self.abin.parent = qunyan;
                //电梯下来
                self.downElevator(false);
            }
        }).start();
    }
    /**
     * 进入电梯
     * @param target 
     */
    abinIntoElevator(target: cc.Node){
       let pos1 = this.abin.parent.convertToWorldSpaceAR(this.abin.getPosition());
       let pos2 = target.parent.convertToWorldSpaceAR(cc.v2(0, this.abin.height/2));//电梯底部对齐的，y轴要多加高度一半
       let newPos = cc.v2(this.abin.x + pos2.x - pos1.x, this.abin.y + pos2.y - pos1.y);
       let self = this;
       cc.tween(this.abin).to(1, {position: newPos}).call(()=>{
           //阿斌父节点设置为电梯
            self.abin.parent = target;
            self.abin.setPosition(0, self.abin.height/2);
            self.closeDoor(true);
       }).start();

    }
    intoElevator(){
        let qunyan: cc.Node[] = [];
        for(let n of this.qunyan.children){
            qunyan.push(n);
        }
        let diantiBody = cc.find("scene/scene_2/dianti/body", this.node);
        let pos: cc.Vec2[] = [cc.v2(-80, 80), cc.v2(60, 120), cc.v2(-120, 140), cc.v2(-60, 180), cc.v2(-30, 210), cc.v2(-120, 230),cc.v2(-120, 250)];
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
            self.scheduleOnce(()=>{
                self.closeDoor(false);
            }, 1);
        }, 1);
    }
    moveToGril(gril: cc.Node){
        let dl1 = cc.find("scene/scene_1/shafa-2/rw-dl1", this.node);
        let dl2 = cc.find("scene/scene_1/shafa-2/rw-dl2", this.node);
        
        let self = this;
        dl1.getComponent(cc.Sprite).spriteFrame = this.levelAtlas.getSpriteFrame("rw-dl-aixin");
        dl2.getComponent(cc.Sprite).spriteFrame = this.levelAtlas.getSpriteFrame("rw-dl-aixin");
        let pos1 = dl1.parent.convertToWorldSpaceAR(dl1.getPosition());
        let pos2 = gril.parent.convertToWorldSpaceAR(gril.getPosition());
        let distanceY = pos1.y - pos2.y;

        let dl_dj = cc.find("scene/scene_1/rw-dl-dj", this.node);
        if(!this.yifu){
            this.abin.getComponent(cc.Sprite).spriteFrame = this.abinSmile;
            //没有穿衣服则成功，两个大佬打架
            cc.tween(dl1).to(1, {position: cc.v2(dl1.x + 50, dl1.y - distanceY)}).start();
            cc.tween(dl2).to(1, {position: cc.v2(dl2.x - 50, dl2.y - distanceY)}).call(()=>{
                self.dajia();
            }).start();
        }else{
            //将阿斌放入场景1
            this.abin.parent = cc.find("scene/scene_1", this.node);
            //穿了衣服，则被纠缠
            let pos3 = this.abin.parent.convertToWorldSpaceAR(this.abin.getPosition());
            let pos4 = dl2.parent.convertToWorldSpaceAR(dl2.getPosition());
            cc.tween(dl2).to(1, {position: cc.v2(dl2.x - 100, dl2.y - distanceY)}).start();
            cc.tween(dl1).to(1, {position: cc.v2(dl1.x - (pos4.x - pos3.x) + dl1.width/2 + this.abin.width/2 + 100, dl1.y - (pos4.y - pos3.y))}).call(()=>{
                self.scheduleOnce(()=>{
                    GameInfo.Instance.unlockAchieved(self.levelNum, 3,false);
                    self.showLevelResult(false, 5, "成双成对？");
                }, 1)
            }).start();
        }
    }
    dajia(){
        let dl_dj = cc.find("scene/scene_1/rw-dl-dj", this.node);
        let dl1 = cc.find("scene/scene_1/shafa-2/rw-dl1", this.node);
        let dl2 = cc.find("scene/scene_1/shafa-2/rw-dl2", this.node);
        let self = this;
        cc.tween(dl1).to(1, {position: cc.v2(dl1.x, dl_dj.y)}).start();
        cc.tween(dl2).to(1, {position: cc.v2(dl2.x, dl_dj.y)}).call(()=>{
            AudioService.Instance.playEffect("fight",true);
            dl1.active = false;
            dl2.active = false;
            dl_dj.active = true;
            self.canChange = true;
            self.changePlayerEvent();
        }).start();
    }

    // qunyanMove(){
    //     let qunyan: cc.Node[] = [];
    //     for(let n of this.qunyan.children){
    //         qunyan.push(n);
    //     }
    //     let diantiBody = cc.find("scene/scene_2/dianti/body", this.node);
    //     let dl_dj = cc.find("scene/scene_1/rw-dl-dj", this.node);

    //     //群演坐标修正偏移
    //     let offsetPos: cc.Vec2[] = [cc.v2(-50, -50), cc.v2(160, 70), cc.v2(75, -45), cc.v2(40, -40), cc.v2(140, -15)];

    //     //打架在scene的位置
    //     let pos1 = this.sceneNode.convertToNodeSpaceAR(dl_dj.parent.convertToWorldSpaceAR(dl_dj.getPosition()));
    //     for(let i=0; i<qunyan.length; i++){
    //         //群演在scene的位置
    //         let pos2 = this.sceneNode.convertToNodeSpaceAR(this.qunyan.convertToWorldSpaceAR(qunyan[i].getPosition()));
    //         let dx = pos2.x - pos1.x;
    //         let dy = pos2.y - pos1.y;
    //         let newPos = cc.v2(qunyan[i].x - dx + offsetPos[i].x, qunyan[i].y - dy + offsetPos[i].y);
    //         cc.tween(qunyan[i]).to(2, {position: newPos}).start();
    //     }
    //     //2秒后电梯开始下降
    //     let self = this;
    //     this.scheduleOnce(()=>{
    //         self.changePlayerEvent();//改变事件状态，可以进行场景切换
    //         self.downElevator(true);
    //     }, 2);
    // }
    qunyanMoveOne(){
        if(this.changeIndex < 0){
            this.canChange = false;
            return;
        }
        let self = this;
        this.changePlayerEvent();
        let qunyan: cc.Node[] = [];
        for(let n of this.qunyan.children){
            qunyan.push(n);
        }
        let diantiBody = cc.find("scene/scene_2/dianti/body", this.node);
        let dl_dj = cc.find("scene/scene_1/rw-dl-dj", this.node);

        //群演坐标修正偏移
        let offsetPos: cc.Vec2[] = [cc.v2(-80, -40),cc.v2(-50, -50), cc.v2(160, 70), cc.v2(75, -45), cc.v2(40, -40), cc.v2(140, -15)];

        qunyan[this.changeIndex].removeComponent(cc.Button);

        //打架在scene的位置
        let pos1 = this.sceneNode.convertToNodeSpaceAR(dl_dj.parent.convertToWorldSpaceAR(dl_dj.getPosition()));
        //群演在scene的位置
        let pos2 = this.sceneNode.convertToNodeSpaceAR(this.qunyan.convertToWorldSpaceAR(qunyan[this.changeIndex].getPosition()));
        let dx = pos2.x - pos1.x;
        let dy = pos2.y - pos1.y;
        let newPos = cc.v2(qunyan[this.changeIndex].x - dx + offsetPos[this.changeIndex].x, qunyan[this.changeIndex].y - dy + offsetPos[this.changeIndex].y);
        cc.tween(qunyan[this.changeIndex]).to(1, {position: newPos}).call(()=>{
            self.changeIndex--;
            self.changePlayerEvent();
            if(self.changeIndex < 0){
                self.downElevator(true);
            }
        }).start();
    }
    sceneChange(type: number, index: number){
        if(!this.canChange){
            return;
        }
        if(type == 2 && index == 1){
            this.qunyanMoveOne();
        }
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
            btnEvent.component = "Dalaodajia";
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
