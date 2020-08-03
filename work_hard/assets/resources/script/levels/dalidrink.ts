import BaseLevel from "../common/BaseLevel";
import PropBar from "../common/PropBar";
import DragBox from "../common/DragBox";
import GameInfo from "../common/GameInfo";
import AudioService from "../common/AudioService";
import GameUtil from "../common/GameUtil";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Dalidrink extends BaseLevel {

    @property(cc.Node)
    abin: cc.Node = null;
    @property(cc.Node)
    xiaomeizhan: cc.Node = null;
    @property(cc.Node)
    door: cc.Node = null;
    @property(cc.Node)
    xiaomei_pop: cc.Node = null;
    @property(cc.Node)
    xiaomei_zhanzi: cc.Node = null;
    @property(cc.Node)
    jinbi: cc.Node = null;
    @property(cc.Node)
    dalidrink: cc.Node = null;
    @property(cc.Node)
    gongnengdrink: cc.Node = null;
    @property(cc.Node)
    door_left: cc.Node = null;
    @property(cc.Node)
    door_right: cc.Node = null;
    @property(cc.Node)
    kai: cc.Node = null;
    @property(cc.Node)
    abindanshou: cc.Node = null;
    @property(cc.Node)
    abinshuangshou: cc.Node = null;
    @property(cc.Node)
    zh1: cc.Node = null;
    @property(cc.Node)
    zh2: cc.Node = null;
    @property(cc.Node)
    zh3: cc.Node = null;
    @property(cc.Node)
    zhiwugui: cc.Node = null;
    @property(cc.Node)
    light : cc.Node = null;


    private istoubi=false;
    private drinknum=0;
    private isxiaomei=false;
    private pointCount=0;
    private abinzishiState=0;
    private static TEXT = {
        Win: "我想开了",
        Dian: "触电的那种感觉慢慢出现",
        Dkj: "打卡机坏了，你迟到了"
    }

    onLoad () {
        let nodes = this.sceneNode.children;
        for(let i=0; i<nodes.length; i++){
            nodes[i].x = i * cc.winSize.width;
            nodes[i].y = 0;
        }

        //动态设置背景墙的高度
        let wall = cc.find("background/wall", this.node);
        wall.height = cc.winSize.height/2;
        this.initPageInfo(2, 3);
        this.loadTarget(this.abin);
        this.jinbi.setPosition(0,0);
        this.jinbi.parent=this.zhiwugui.children[Math.floor(Math.random()*9)];
	}

    start () {

    }

    getxiaomei(e: cc.Event.EventTouch){
         let xiaomei_zuozi=e.target;
         xiaomei_zuozi.active=false;
         let xiaomei_pop: cc.Node=this.xiaomei_pop
         if(PropBar.Instance.propExist(xiaomei_pop)){
            return;
        }
        let self =this;
        PropBar.Instance.addProp(xiaomei_pop,function(){
            let dragBox=xiaomei_pop.getComponent(DragBox);
            dragBox.setInitPos(xiaomei_pop.getPosition());
            dragBox.dragabled=true;
            dragBox.setReceiveCallback(self.dragReceiver_xiaomei.bind(self));
        });
    }

    dragReceiver_xiaomei(drag: DragBox, receiver: cc.Collider){
        if(receiver.node.name=="xiaomei_receiver"){
            this.xiaomei_pop.active=false;
            this.xiaomei_zhanzi.active=true;
            this.isxiaomei=true;
            this.abinzishiState++;
             if(this.abinzishiState==1){
                this.abindanshou.active=true;
                this.abinshuangshou.active=false;
                this.abin.active=false;
             }
             if(this.abinzishiState==2){
                this.abindanshou.active=false;
                this.abinshuangshou.active=true;
                this.abin.active=false;
            }
            PropBar.Instance.removeProp(drag.node,true);
        }
        else{
            drag.returnInitPos();
        }
    }

    openbox(e: cc.Event.EventTouch){
        AudioService.Instance.playEffect("boxOpen",false);
        let box_door_parent=e.target;
        box_door_parent.children[0].active=false;
        box_door_parent.children[1].active=true;
        if(box_door_parent.childrenCount==3){
            this.jinbi.active=true;
        }
    }

    getjinbi(e: cc.Event.EventTouch){
        let jinbi=e.target;
        if(PropBar.Instance.propExist(jinbi)){
            return;
        }
        let self =this;
        PropBar.Instance.addProp(jinbi,function(){
            let dragBox=jinbi.getComponent(DragBox);
            dragBox.setInitPos(jinbi.getPosition());
            dragBox.dragabled=true;
            dragBox.setReceiveCallback(self.dragReceiver_jinbi.bind(self));
        });
    }
    
    dragReceiver_jinbi(drag: DragBox, receiver: cc.Collider){
        if(receiver.node.name=="jinbi_receiver"){
            AudioService.Instance.playEffect("自动贩卖机投币",false);
            this.jinbi.active=false;
            this.istoubi=true;
            PropBar.Instance.removeProp(drag.node,true);
            this.light.active = true;
            this.light.runAction(cc.blink(100,100));
        }
        else{
            drag.returnInitPos();
        }
    }

    getdrink(e: cc.Event.EventTouch){
        if(this.istoubi){
            this.light.stopAllActions();
            let anniu=e.target;
            var kaiAnim=this.kai.getComponent(cc.Animation);
            AudioService.Instance.playEffect("自动贩卖机开启",false);
            var kaiAnimState=kaiAnim.play('kai');
            kaiAnim.on('finished',()=>{this.xianshidrink(anniu.name)},this);
            this.istoubi=false;
            this.light.active = false;
        } 
    }

    xianshidrink(date:String){
        let anniuname=date;
        if(anniuname=="anniu-1"||anniuname=="dali"){
            this.dalidrink.active=true;
         }
         if(anniuname=="anniu-2"||anniuname=="gongneng"){
            this.gongnengdrink.active=true;
         }
    }
    collectdrink(e: cc.Event.EventTouch){
        let drink=e.target;
         if(PropBar.Instance.propExist(drink)){
            return;
        }
        let self =this;
        PropBar.Instance.addProp(drink,function(){
            let dragBox=drink.getComponent(DragBox);
            dragBox.setInitPos(drink.getPosition());
            dragBox.dragabled=true;
            dragBox.setReceiveCallback(self.dragReceiver_drink.bind(self));
        });
    }

    dragReceiver_drink(drag: DragBox, receiver: cc.Collider){
        if(receiver.node.name=="abin"){
            if(drag.node.name=="zdsmj-dali"){
                this.dalidrink.active=false;
                this.drinknum=1;
                this.abinzishiState++;
                if(this.abinzishiState==1){
                   this.abindanshou.active=true;
                   this.abinshuangshou.active=false;
                   this.abin.active=false;
                }
                if(this.abinzishiState==2){
                   this.abindanshou.active=false;
                   this.abinshuangshou.active=true;
                   this.abin.active=false;
               }
                // var abinbianAnim=this.abin.getComponent(cc.Animation);
                // var abinbianAnimState=abinbianAnim.play('abinbian');
           }
           if(drag.node.name=="zdsmj-gongnen"){
                this.abin.parent.getChildByName("han").active = false;
                this.gongnengdrink.active=false;
                this.drinknum=2;
           }  
        }
        else{
            drag.returnInitPos();
        }
    }
    
    /**
     * 修改当前节点的父节点，节点显示位置不变
     * @param current 当前节点 
     * @param newParent 新的父节点
     */
    transportParent(current : cc.Node , newParent : cc.Node){
        let current_pos_world = current.convertToWorldSpaceAR(cc.v2(0,0));
        let current_queue_pos = newParent.convertToNodeSpaceAR(current_pos_world);
        current.parent = newParent;
        current.setPosition(current_queue_pos);
    }

    getzhuanghan(e: cc.Event.EventTouch){
        if(this.isxiaomei){
             if(this.drinknum==2){
                GameInfo.Instance.unlockAchieved(this.levelNum, 2,false);
                this.showLevelResult(false, 3, "我还会回来的");
             }
             else if(this.drinknum==1){
                    var abinganAnim=this.abinshuangshou.getComponent(cc.Animation);
                    let han = this.abin.parent.getChildByName("han");
                    this.transportParent(han,this.abinshuangshou);
                    var abinganAnimState=abinganAnim.play('abindali');
                    // abinganAnim.on('finished',this.zhuanghan,this);
                    this.zhuanghan();
                //  this.pointCount++;
                //  if(zhuanghan.name=="rw-zh"){
                //     var zhuanghan1moveAnim=zhuanghan.getComponent(cc.Animation);
                //     var zhuanghan1moveAnimState=zhuanghan1moveAnim.play('zhuanghan1move');
                //     zhuanghan1moveAnim.on('finished',()=>{this.zhVanish(zhuanghan)},this);
                //     if(this.pointCount==3){
                //         zhuanghan1moveAnim.on('finished',()=>{this.zhVanishend(zhuanghan)},this);
                //     }
                //     else{
                //         zhuanghan1moveAnim.on('finished',()=>{this.zhVanish(zhuanghan)},this);
                //     }
                //  }
                //  else if(zhuanghan.name=="rw-zh2"){
                //     var zhuanghan2moveAnim=zhuanghan.getComponent(cc.Animation);
                //     var zhuanghan2moveAnimState=zhuanghan2moveAnim.play('zhuanghan2move');
                //     zhuanghan2moveAnim.on('finished',()=>{this.zhVanish(zhuanghan)},this);
                //     if(this.pointCount==3){
                //         zhuanghan2moveAnim.on('finished',()=>{this.zhVanishend(zhuanghan)},this);
                //     }
                //     else{
                //         zhuanghan2moveAnim.on('finished',()=>{this.zhVanish(zhuanghan)},this);
                //     }
                //  }
                //  else{
                //     var zhuanghan3moveAnim=zhuanghan.getComponent(cc.Animation);
                //     var zhuanghan3moveAnimState=zhuanghan3moveAnim.play('zhuanghan3move');
                //     if(this.pointCount==3){
                //         zhuanghan3moveAnim.on('finished',()=>{this.zhVanishend(zhuanghan)},this);
                //     }
                //     else{
                //         zhuanghan3moveAnim.on('finished',()=>{this.zhVanish(zhuanghan)},this);
                //     }
                //  }
             }
             else{
               this.showLevelResult(false, 2, "我还会再回来的");
               GameInfo.Instance.unlockAchieved(this.levelNum, 2,false);
             }
        }
        else{
           this.showLevelResult(false, 2, "我会回来的");
           GameInfo.Instance.unlockAchieved(this.levelNum, 2,false);
        }
    }


   zhuanghan(){
       var zhuanghan2moveAnim=this.zh2.getComponent(cc.Animation);
       var zhuanghan2moveAnimState=zhuanghan2moveAnim.play('zhuanghan2move');
        zhuanghan2moveAnim.on('finished',this.zhuanghan2,this);
   }
    
    zhuanghan2(){
        AudioService.Instance.playEffect("cast",false);
        this.zh2.active=false;
        var zhuanghan1moveAnim=this.zh1.getComponent(cc.Animation);
        var zhuanghan1moveAnimState=zhuanghan1moveAnim.play('zhuanghan1move');
        zhuanghan1moveAnim.on('finished',this.zhuanghan3,this);
    }

    zhuanghan3(){
        AudioService.Instance.playEffect("cast",false);
        this.zh1.active=false;
        var zhuanghan3moveAnim=this.zh3.getComponent(cc.Animation);
        var zhuanghan3moveAnimState=zhuanghan3moveAnim.play('zhuanghan3move');
        zhuanghan3moveAnim.on('finished',this.zhVanishend,this);
    }

    zhVanish(e:cc.Node){
        let zhuanghan=e;
        zhuanghan.active=false;
    }

    zhVanishend(e:cc.Node){
        this.zh3.active=false;
        var xiaomeimoveAnim=this.xiaomeizhan.getComponent(cc.Animation);
        var xiaomeimoveAnimState=xiaomeimoveAnim.play('xiaomeiMove');
        xiaomeimoveAnim.on('finished',this.doorMove,this);
    }

    doorMove(){
        AudioService.Instance.playEffect("电梯开门",false);
        var doorleftmoveAnim=this.door_left.getComponent(cc.Animation);
        var doorleftmoveAnimState=doorleftmoveAnim.play('door_left');
        var doorrightmoveAnim=this.door_right.getComponent(cc.Animation);
        var doorrightmoveAnimState=doorrightmoveAnim.play('door_right');
        doorrightmoveAnim.on('finished',this.successed,this);
    }

    successed(){
        GameInfo.Instance.unlockAchieved(this.levelNum, 1,true);
        this.showLevelResult(true, 1, "哥哥敲腻害♂");
    }


    changebigger(e : cc.Event.EventTouch){
        let target = e.target;
        let cameraNode = cc.find("Main Camera",cc.Canvas.instance.node);
        let camera = cameraNode.getComponent(cc.Camera);
        camera.zoomRatio = 4;
        cameraNode.setPosition(target.getPosition());
    }
    
    changesmall(e : cc.Event.EventTouch){
        let cameraNode = cc.find("Main Camera",cc.Canvas.instance.node);
        let camera = cameraNode.getComponent(cc.Camera);
        camera.zoomRatio = 1;
        cameraNode.setPosition(cc.v2(0,0));
    }
}
