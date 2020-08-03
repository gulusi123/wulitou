import BaseLevel from "../common/BaseLevel";
import PropBar from "../common/PropBar";
import DragBox from "../common/DragBox";
import GameInfo from "../common/GameInfo";
import GameScene from "../GameScene";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Tebu extends BaseLevel {

    @property(cc.SpriteAtlas)
    renwuAtlas: cc.SpriteAtlas = null;
    @property(cc.SpriteAtlas)
    levelAtlas: cc.SpriteAtlas = null;
    @property(cc.Node)
    abin: cc.Node = null;
    @property(cc.Node)
    elderly: cc.Node = null;
    @property(cc.Sprite)
    personA: cc.Sprite = null;
    @property(cc.Sprite)
    personB: cc.Sprite = null;
    @property(cc.SpriteFrame)
    haveGetShoes : cc.SpriteFrame = null;

    private personASj = false;
    private xieziFlag = false;
    onLoad () {
        //动态设置背景墙的高度
        let wall = cc.find("background/wall", this.node);
        wall.height = cc.winSize.height/2;
        let road = cc.find("background/road", this.node);
        road.height = cc.winSize.height + road.y;

        this.initPageInfo(2, 2);
        this.loadTarget(this.abin);
        //this.elderlyWalk();
	}

    start () {

    }
    /**
     * 
     * @param e 点击收集道具
     * @param data 
     */
	clickProp(e: cc.Event.EventTouch, data: string){
        let prop: cc.Node = e.target;
        if(PropBar.Instance.propExist(prop)){
            return;
        }
        let self = this;
        if(data == "shouji"){//如果是手机，显示手机道具，将阿斌的人物换成没有手机的图
            let sprite = prop.parent.getComponent(cc.Sprite);
            sprite.node.x -= 2;//修复换图抖动
            sprite.spriteFrame = this.renwuAtlas.getSpriteFrame("abin");
            let sj = cc.find("shouji", prop);
            sj.active = true;
        }
        PropBar.Instance.addProp(prop, ()=>{
            let drag: DragBox = prop.getComponent(DragBox);
            drag.setInitPos(prop.getPosition());//一定要设置新的初始位置
            drag.dragabled = true;//设置组件可拖拽
            drag.setReceiveCallback(self.dragReceiver.bind(self));//绑定拖拽回调
        });
    }
    /**
     * 
     * @param drag 道具拖拽回调
     * @param receiver 
     */
    dragReceiver(drag: DragBox, receiver: cc.Collider){
        if(drag.tag == 1 && receiver.tag == 1){
            //鞋子给老人
            PropBar.Instance.removeProp(drag.node, true);
            this.elderly.getComponent(cc.Sprite).spriteFrame = this.haveGetShoes;
            // this.elderlyFly();
            this.xieziFlag = true;
        }else if(drag.tag == 2 && receiver.tag == 2){
            //手机给路人A
            if(this.isPlayerEvent()){
                drag.returnInitPos();
            }else{
                PropBar.Instance.removeProp(drag.node, true);
                // this.showLevelResult(false, 4, "手机内存满了");
                this.personA.spriteFrame = this.levelAtlas.getSpriteFrame("rw-lrA-sj");
                this.personASj = true;
            }
        }else if(drag.tag == 2 && receiver.tag == 3){
            //手机给路人B
            if(this.isPlayerEvent()){
                drag.returnInitPos();
            }else{
                PropBar.Instance.removeProp(drag.node, true);
                this.escape();
            }
            
        }else{
            drag.returnInitPos();
        }
    }

    /**
     * 帮助老人过马路
     */
    helpTheElderly(e: cc.Event.EventTouch){
        //移除老人按钮组件
        e.target.removeComponent(cc.Button);
        if(this.isPlayerEvent()){
            return;
        }
        this.changePlayerEvent();
        let self = this;
        //先走到老人身旁
        let abin_pos = this.abin.parent.convertToWorldSpaceAR(this.abin.getPosition());
        let elderly_pos = this.elderly.parent.convertToWorldSpaceAR(this.elderly.getPosition());
        let abinAction = cc.moveTo(1, cc.v2(this.abin.x + elderly_pos.x - abin_pos.x, this.abin.y));
        let time = 1;
        if(self.personASj && !self.xieziFlag){
            time = 3;
        }else if(self.xieziFlag && self.personASj){
            time = 0.5;
        }

        let elderlyAction = cc.moveTo(time, cc.v2(this.elderly.x, this.elderly.y + 300));
        let elderlyActionEnd = cc.callFunc(()=>{
            if(self.personASj && self.xieziFlag){
                GameInfo.Instance.unlockAchieved(self.levelNum, 1,true);
                self.showLevelResult(true, 1, "特布，飞一般的感觉");
                return;
            }
            //修改老人图片为讹人，修改阿斌图片及位置
            if(self.personASj){
                self.scheduleOnce(()=>{
                    self.showLevelResult(false, 0, "步步慢");
                }, 0.5);
            }else{
                let sprite = self.elderly.getComponent(cc.Sprite);
                
                sprite.spriteFrame = this.xieziFlag?
                       self.levelAtlas.getSpriteFrame("rw-lr-pc2"):self.levelAtlas.getSpriteFrame("rw-lr-pc");
                sprite.node.y -= 150;
                sprite.node.x -=50;

                self.abin.y += 300;
                self.abin.x += 50;
                let abinSprite = self.abin.getComponent(cc.Sprite);
                abinSprite.spriteFrame = self.levelAtlas.getSpriteFrame("rw-zj-bpc");
                self.abin.active = true;
                //显示失败结果
                self.scheduleOnce(()=>{
                    let resultNum = 32;
                    if(!this.xieziFlag){
                        resultNum = 3;
                    }
                    GameInfo.Instance.unlockAchieved(self.levelNum, resultNum == 3 ? 3 : 4 , false);
                    self.showLevelResult(false, resultNum, "讹讹讹，屈想向天歌");
                }, 0.5);
            }
        });
        let abinActionEnd = cc.callFunc(()=>{
            self.abin.active = false;
            //将老人的图片修改为扶老人的图片
            let sprite = self.elderly.getComponent(cc.Sprite);
            sprite.spriteFrame = this.xieziFlag?
                   self.levelAtlas.getSpriteFrame("rw-gml2"):self.levelAtlas.getSpriteFrame("rw-gml");
            self.elderly.runAction(cc.sequence(elderlyAction, elderlyActionEnd));
        });
        this.abin.runAction(cc.sequence(abinAction, abinActionEnd));
    }

    /**
     * 鞋给老人飞过马路
     */
    /**
    elderlyFly(){
        if(this.isPlayerEvent()){
            return;
        }
        this.changePlayerEvent();
        let self = this;
        let sprite = self.elderly.getComponent(cc.Sprite);
        sprite.spriteFrame = self.levelAtlas.getSpriteFrame("rw-lr-tb");
        let elderlyAction = cc.moveTo(1, cc.v2(this.elderly.x, this.elderly.y + 400));
        let elderlyActionEnd = cc.callFunc(()=>{
            self.showLevelResult(true, 1, "特布飞一般的感觉");
        });
        this.elderly.runAction(cc.sequence(elderlyAction, elderlyActionEnd));
    }
     */
    /**
     * 直接过马路
     */
    goWay(e: cc.Event.EventTouch){
        //移除斑马线的按钮组件
        e.target.removeComponent(cc.Button);
        if(this.isPlayerEvent()){
            return;
        }
        this.changePlayerEvent();
        let self = this;

        let abin_pos = this.abin.parent.convertToWorldSpaceAR(this.abin.getPosition());
        let elderly_pos = this.elderly.parent.convertToWorldSpaceAR(this.elderly.getPosition());
        let personb_pos = this.personB.node.parent.convertToWorldSpaceAR(this.personB.node.getPosition());
        //走到老人身边动作
        let abinAction = cc.moveTo(1, cc.v2(this.abin.x + elderly_pos.x - abin_pos.x, this.abin.y));
        //过马路动作
        let goWayAction = cc.moveTo(1, cc.v2(this.abin.x + elderly_pos.x - abin_pos.x, this.abin.y + 400));
        //路人B移动动作
        let movePerponB = cc.moveTo(0.5, cc.v2(this.personB.node.x + elderly_pos.x - personb_pos.x, this.personB.node.y));
        let resultAction = cc.callFunc(()=>{
            GameInfo.Instance.unlockAchieved(self.levelNum, 2,false);
            self.showLevelResult(false, 2, "好多盐汽水");
        });

        //更换路人A和B的帧为生气
        let changeSprite = cc.callFunc(()=>{
            self.personA.spriteFrame = self.levelAtlas.getSpriteFrame("rw-lrA-sq");
            self.personB.spriteFrame = self.levelAtlas.getSpriteFrame("rw-lrB-sq");
            self.personB.node.runAction(cc.sequence(movePerponB, resultAction));
        });
        this.abin.runAction(cc.sequence(abinAction, goWayAction, changeSprite));
    }

    /**
     * 路人B，拿到手机跑路
     */
    escape(){
        //更换路人B的动画帧为跑路帧
        let self = this;
        this.personB.spriteFrame = this.levelAtlas.getSpriteFrame("rw-lrB-pao");
        let action = cc.moveTo(1, cc.v2(this.personB.node.x - cc.winSize.width/2, this.personB.node.y));
        let actionEnd = cc.callFunc(()=>{
            self.personB.node.active = false;
            GameInfo.Instance.unlockAchieved(self.levelNum, 5,false);
            self.showLevelResult(false, 51, "人性扭曲？道德沦丧？");
        });
        this.personB.node.runAction(cc.sequence(action, actionEnd));
    }

    // /**
    //  * 老人走几步挡住路
    //  */
    // elderlyWalk(){
    //     this.changePlayerEvent();
    //     let self = this;
    //     let action = cc.moveTo(1, cc.v2(this.elderly.x, this.elderly.y + 80));
    //     let actionEnd = cc.callFunc(()=>{
    //         self.changePlayerEvent();
    //     });
    //     this.elderly.runAction(cc.sequence(action, actionEnd));
    // }
}
