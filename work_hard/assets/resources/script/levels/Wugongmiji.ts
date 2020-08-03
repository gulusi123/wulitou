import BaseLevel from "../common/BaseLevel";
import PropBar from "../common/PropBar"
import DragBox from "../common/DragBox"
import GameInfo from "../common/GameInfo";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Wugongmiji extends BaseLevel {


    @property(cc.Node)
    abin: cc.Node = null;
    @property(cc.SpriteFrame)
    girlNoraml : cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    girlGetBBT : cc.SpriteFrame = null;
    private littleGirlGetBBT = false;
    private qigaiGetMoney = false;
    private isGetMiji = true;
    private isLBWB = false;
    private currentPage = 1;
    private getLBWB = false;

    private static TEXT = {
        Win: "吃俺老孙一扇",
        Dalei:"打雷啦",
        Dkj: "你被淋成落汤鸡啦"
    }
    onLoad () {
        //动态设置背景墙的高度
        let wall = cc.find("background/wall", this.node);
        wall.height = cc.winSize.height/2;
        let road = cc.find("background/road", this.node);
        road.height = cc.winSize.height + road.y;
        
        this.initPageInfo(2, 3);
        this.loadTarget(this.abin);
      
	}
    
    bbt_collect(e : cc.Event.EventTouch){
        e.target.removeComponent(cc.Button);
        let bbt_gun = cc.find("abin/bbt-gun",this.node);
        bbt_gun.active = false;
        bbt_gun.removeComponent(cc.Button);
        let bbt = cc.find("abin/bbt",this.node);
        bbt.active = true;
        if(PropBar.Instance.propExist(bbt)){    
            return; 
        }
        let self = this;
        PropBar.Instance.addProp(bbt, ()=>{
            let drag: DragBox = bbt.getComponent(DragBox);
            drag.node.removeComponent(cc.Button);//移除按钮事件
            drag.setInitPos(bbt.getPosition());//一定要设置新的初始位置
            drag.dragabled = true;//设置组件可拖拽
            drag.setReceiveCallback(self.dragReceiver.bind(self));//绑定拖拽回调
        });
    }
   
    savePot_collet(e : cc.Event.EventTouch){
        let savePot = e.target;//存钱罐
        if(!this.littleGirlGetBBT){
            GameInfo.Instance.unlockAchieved(this.levelNum, 4,false);
            this.showLevelResult(false,4,"我不是坏蜀黍");
            return;
        }
        if(PropBar.Instance.propExist(savePot)){
            return; 
        }
        let self = this;
        PropBar.Instance.addProp(savePot, ()=>{
            let drag: DragBox = savePot.getComponent(DragBox);
            drag.node.removeComponent(cc.Button);//移除按钮事件
            drag.setInitPos(savePot.getPosition());//一定要设置新的初始位置
            drag.dragabled = true;//设置组件可拖拽
            drag.setReceiveCallback(self.dragReceiver.bind(self));//绑定拖拽回调
            let littltGirl = cc.find("scene/scene_1/littleGirl",self.node);
            littltGirl.getComponent(cc.Sprite).spriteFrame = self.girlNoraml;
        });
    }

    dragReceiver(drag: DragBox, receiver: cc.Collider){
        let tag_prop = drag.tag;
        if(receiver.tag == 1 && tag_prop == 0){//小女孩&棒棒糖
            PropBar.Instance.removeProp(drag.node);
            drag.dragabled = false;
            PropBar.Instance.removeProp(drag.node);
            drag.node.active = false;
            this.littleGirlGetBBT = true;//小女孩得到棒棒糖
            let littltGirl = cc.find("scene/scene_1/littleGirl",this.node);
            littltGirl.getComponent(cc.Sprite).spriteFrame = this.girlGetBBT;
        }else if (receiver.tag == 2 && tag_prop == 1){
            PropBar.Instance.removeProp(drag.node);
            drag.dragabled = false;
            PropBar.Instance.removeProp(drag.node);
            drag.node.parent = receiver.node;
            drag.node.setPosition(cc.v2(80 , -60));
            this.qigaiGetMoney = true;//乞丐得到钱
        }else if(receiver.tag == 3 && tag_prop >= 3){
            PropBar.Instance.removeProp(drag.node);
            drag.dragabled = false;
            if(tag_prop == 4){
                this.getLBWB = true;
            }
            this.getWugongCallBack();
        }else{
            drag.returnInitPos();
        }
    }
    
    getWugongCallBack(){
        let repeat = 2 - this.currentPage;
        this.transPortScene(repeat);
    };
    


    buttonClick(e : cc.Event.EventTouch , str :string){
        e.target.getComponent(cc.Button).interactable = false;
        if(str == "qigai"){
            if(this.qigaiGetMoney){
                e.target.getComponent(cc.Button).interactable = false;
                let talk1 = e.target.getChildByName("talk");
                cc.tween(talk1)
                  .to(1.5,{opacity : 255})
                  .delay(2)
                  .to(1.5,{opacity : 0})
                  .call(function(){
                    e.target.getComponent(cc.Button).interactable = true;
                  }.bind(this))
                  .start();
            }else{
                GameInfo.Instance.unlockAchieved(this.levelNum, 2,false);
                this.showLevelResult(false,2,"我可是丐帮八袋长老！");
            }
        }else if(str == "ftb"){
            GameInfo.Instance.unlockAchieved(this.levelNum, 5,false);
            this.showLevelResult(false,5,"小弱鸡");
        }else{
            this.miji_collect(e,str);
        }
    }
  
    miji_collect(e : cc.Event.EventTouch , str : string){
        let book  =  e.target;
        if(!this.qigaiGetMoney){
            GameInfo.Instance.unlockAchieved(this.levelNum, 2,false);
            this.showLevelResult(false,2,"咋地,想白嫖");
            return;
        }
        let miji = cc.find("scene/scene_2/miji",this.node);
        let books = miji.children;
        for(let i = 0 ; i < books.length ; i ++){
            books[i].getComponent(cc.Button).interactable = false;
        }
        if(PropBar.Instance.propExist(book)){
            return; 
        }
        let self = this;
        PropBar.Instance.addProp(book, ()=>{
            let drag: DragBox = book.getComponent(DragBox);
            drag.node.removeComponent(cc.Button);//移除按钮事件
            drag.setInitPos(book.getPosition());//一定要设置新的初始位置
            drag.dragabled = true;//设置组件可拖拽
            drag.setReceiveCallback(self.dragReceiver.bind(self));//绑定拖拽回调
            let littltGirl = cc.find("scene/scene_1/littleGirl",self.node);
            littltGirl.getComponent(cc.Sprite).spriteFrame = self.girlNoraml;
        });
    }

    sceneChange(type :number ,index :number){
        this.currentPage = index;
    }
    
    /**
     * 场景转换
     */
    transPortScene(count : number){
        if(this.isPlayerEvent()){
            return;
        }
        this.changePlayerEvent();
        
        if(this.pageIndex + count >= this.totalPage){
            this.pageIndex = this.totalPage - 1;
            return;
        }
        this.pageIndex += count;
        let self = this;
        cc.tween(this.sceneNode)
          .to(0.8*count,{x : -this.pageIndex * this.node.width})
          .call(function(){
            if(self.pageIndex == self.totalPage - 1){
                self.nextBtn.active = false;
            }
            self.previousBtn.active = true;
            self.changePlayerEvent();
            if(typeof(self["sceneChange"]) == "function"){
                self["sceneChange"](2, self.pageIndex);
            }   
          })
          .call(self.abinMove.bind(this))
          .start();
    }
    
    abinMove(){
        let anim = this.abin.getComponent(cc.Animation);
        anim.play("abinToCompany");
        anim.on("finished",function(){
            anim.off("finished")
            if(this.getLBWB){
                anim.play("abinToCompany1");
                anim.on("finished",function(){
                    GameInfo.Instance.unlockAchieved(this.levelNum, 1,true);
                    this.showLevelResult(true,1,"凌波微步,不用走路")
                }.bind(this))
            }else{
                GameInfo.Instance.unlockAchieved(this.levelNum, 3,false);
                this.showLevelResult(false,3,"大战三百回合")
            }
        }.bind(this));
    }

    start () {

    }


}
