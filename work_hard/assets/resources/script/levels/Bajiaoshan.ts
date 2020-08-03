import BaseLevel from "../common/BaseLevel";
import PropBar from "../common/PropBar"
import DragBox from "../common/DragBox"
import GameInfo from "../common/GameInfo";
import AudioService from "../common/AudioService";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Bajiaoshan extends BaseLevel {


    @property(cc.Node)
    abin: cc.Node = null;
    @property(cc.Sprite)
    lajitongGai : cc.Sprite = null;
    @property(cc.Sprite)
    zhiban : cc.Sprite = null;
    @property(cc.Node)
    yun : cc.Node = null;
    @property(cc.Prefab)
    yudian : cc.Prefab = null;
    @property(cc.SpriteFrame)
    abinShanShanzi : cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    shanjia : cc.SpriteFrame = null;


    private personASj = false;
    
    public static Instance: Bajiaoshan = null;
    private yuDianPool: cc.NodePool = null;
    
    private static TEXT = {
        Win: "多谢嫂嫂",
        Dalei:"雷好啊",
        Dkj: "你被淋成落汤鸡啦"
    }
    onLoad () {
        //动态设置背景墙的高度
        let wall = cc.find("background/wall", this.node);
        wall.height = cc.winSize.height/2;
        let road = cc.find("background/road", this.node);
        road.height = cc.winSize.height + road.y;
        
        Bajiaoshan.Instance = this;
        this.initPageInfo(2, 2);
        this.loadTarget(this.abin);
        this.createYuDiPoll();
        
        //获取碰撞检测系统
        var manager = cc.director.getCollisionManager();
        manager.enabled = true;
        let self = this;
        this.yun.getChildByName("wuyun").getComponent(cc.Animation).play("yunNormal");
        AudioService.Instance.playEffect("rain",true);
        this.schedule(function(){
            self.getYuDian();
        },0.4);
	}
    
    yushanClick(e : cc.Event.EventTouch){
        let yushan = e.target
        if(PropBar.Instance.propExist(yushan)){
            return; 
        }
        let self = this;
        PropBar.Instance.addProp(yushan, ()=>{
            let drag: DragBox = yushan.getComponent(DragBox);
            drag.node.removeComponent(cc.Button);//移除按钮事件
            drag.node.y = -20;
            drag.setInitPos(yushan.getPosition());//一定要设置新的初始位置
            drag.dragabled = true;//设置组件可拖拽
            drag.setReceiveCallback(self.dragReceiver.bind(self));//绑定拖拽回调
        });
    }

    
    laJiTongClick(e : cc.Event.EventTouch){
        e.target.getComponent(cc.Button).enabled = false;
        let anim_lajitong = this.lajitongGai.getComponent(cc.Animation);
        let self = this;
        anim_lajitong.play("lajitong");
        anim_lajitong.on("finished",function(){
            anim_lajitong.off("finished");
            let anim_zhiban = self.zhiban.getComponent(cc.Animation);
            anim_zhiban.play("zhiban");
            anim_zhiban.on("finished",function(){
                anim_zhiban.off("finished");
                self.zhiban.getComponent(cc.Button).interactable = true;
            })
        });
    }
    
    zhibanClick(e: cc.Event.EventTouch){
        let zhiban = e.target
        if(PropBar.Instance.propExist(zhiban)){
            return; 
        }
        let self = this;
        PropBar.Instance.addProp(zhiban, ()=>{
            let drag: DragBox = zhiban.getComponent(DragBox);
            drag.node.removeComponent(cc.Button);//移除按钮事件
            drag.setInitPos(zhiban.getPosition());//一定要设置新的初始位置
            drag.dragabled = true;//设置组件可拖拽
            drag.setReceiveCallback(self.dragReceiver.bind(self));//绑定拖拽回调
        });
    }
    
    bajiaoshanClick(e: cc.Event.EventTouch){
        let bajiaoshan = e.target
        if(PropBar.Instance.propExist(bajiaoshan)){
            return; 
        }
        let self = this;
        PropBar.Instance.addProp(bajiaoshan, ()=>{
            let drag: DragBox = bajiaoshan.getComponent(DragBox);
            drag.node.removeComponent(cc.Button);//移除按钮事件
            drag.setInitPos(bajiaoshan.getPosition());//一定要设置新的初始位置
            drag.dragabled = true;//设置组件可拖拽
            drag.setReceiveCallback(self.dragReceiver.bind(self));//绑定拖拽回调
        });
    }
    
    wuyunClick(e: cc.Event.EventTouch){
        let wuyun = this.yun.getChildByName("wuyun")
        wuyun.removeComponent(cc.Button);
        let shandian = this.yun.getChildByName("shandian");
        shandian.active = true;
        cc.find("yun/abin",this.node).active = false;
        cc.find("yun/abin2",this.node).active = true;
        AudioService.Instance.playEffect("打雷",false);
        let levelNum = this.levelNum;
        this.scheduleOnce(function(){
            this.showLevelResult(false, 3, Bajiaoshan.TEXT.Dalei);
            //GameInfo.Instance.unlockAchieved(levelNum,3); 
        }.bind(this),0.5);
    }

    dragReceiver(drag: DragBox, receiver: cc.Collider){
        let tag_prop = drag.tag;
        if(receiver.tag == 2){
            PropBar.Instance.removeProp(drag.node);
            drag.dragabled = false;
            switch(tag_prop){
                case 3://纸板
                    drag.node.active = false;
                    cc.find("yun/abin",this.node).active = false;
                    cc.find("yun/abin3",this.node).active = true;
                    this.scheduleOnce(function(){
                        GameInfo.Instance.unlockAchieved(this.levelNum, 3,false);
                        this.showLevelResult(false, 4, "湿身play");
                    }.bind(this),0.5);
                    break;
                case 4://雨伞
                    drag.node.parent = receiver.node;
                    drag.node.getComponent(cc.Sprite).spriteFrame = this.shanjia;
                    drag.node.setPosition(0, 120);
                    this.scheduleOnce(function(){
                        GameInfo.Instance.unlockAchieved(this.levelNum, 2,false);
                        this.showLevelResult(false, 2, "伞，散");
                    }.bind(this),0.5);
                    break;
                case 5://芭蕉扇
                    let anim_yun = this.yun.getChildByName("wuyun").getComponent(cc.Animation);
                    anim_yun.node.zIndex = 2;
                    AudioService.Instance.playEffect("芭蕉扇扇风",false);
                    anim_yun.play("yunMove");
                    this.abin.getComponent(cc.Sprite).spriteFrame = this.abinShanShanzi;
                    anim_yun.on("finished",function(){
                        anim_yun.off("finished");
                        GameInfo.Instance.unlockAchieved(this.levelNum, 1,true);
                        this.showLevelResult(true, 1, Bajiaoshan.TEXT.Win);        
                    }.bind(this));
                    break;   
            }
        }else{
            drag.returnInitPos();
        }
    }
    
    getYuDian(){
        let jiange = 40;
        let wuyun = this.yun.getChildByName("wuyun");

        let x_start = -wuyun.width/3 - Math.random()*30 ;
        let x  = 0;
        let yudi = null;
        for(let i = 1 ; i > 0 ; i++){
            if(this.yuDianPool.size() > 0){
                yudi = this.yuDianPool.get()
            }else{
                yudi = cc.instantiate(this.yudian);
            }
            
            let y = 0 - 40;
            if(i == 1){
                x = x_start;
            }else{
                x = x + jiange;
                jiange = Math.random()*13 + 27; 
            }
            if(x  > wuyun.width/2 -30){
                break;
            }
            yudi.getComponent("Bajiaoshan_yuDi").downSpeed = Math.random()* 3 + 3;
            this.yun.getChildByName("wuyun").addChild(yudi);
            yudi.setPosition(cc.v2(x,y));
        }
    }

    //创建雨点对象池
    createYuDiPoll(){
        this.yuDianPool =new cc.NodePool();
        for(let i = 0 ; i < 30 ; i ++){
          let pre_YuDian = cc.instantiate(this.yudian);
          this.yuDianPool.put(pre_YuDian);
        }
    }
    

    //雨滴销毁
    onYuDianKilled(yuDian){
        this.yuDianPool.put(yuDian);
    }

    start () {

    }
}
