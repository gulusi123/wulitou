import BaseLevel from "../common/BaseLevel";
import PropBar from "../common/PropBar";
import DragBox from "../common/DragBox";
import GameInfo from "../common/GameInfo";
import AudioService from "../common/AudioService";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Bangxiaomei extends BaseLevel {
   
    @property(cc.Node)
    xiaomei:cc.Node=null;
    @property(cc.Node)
    abin:cc.Node=null;
    @property(cc.Node)
    left:cc.Node=null;
    @property(cc.Node)
    right:cc.Node=null;
    @property(cc.Node)
    abin2:cc.Node=null;
    @property(cc.Node)
    xiaomei2:cc.Node=null;
    @property(cc.Node)
    xiangzi:cc.Node=null;
    @property(cc.Node)
    xiangzi2:cc.Node=null;
    @property(cc.Node)
    xiangzi3:cc.Node=null;
    @property(cc.Node)
    xianshi:cc.Node=null;
    @property(cc.SpriteFrame)
    abinSmile : cc.SpriteFrame = null;

    private isGetdianti=false;
    private isSucceed=false;
    private xiangziNumber=0;
    private isxiaomeimoved=false;
    private abinGetBox = 0;

    private static TEXT = {
        Win: "我想开了",
        Dian: "触电的那种感觉慢慢出现",
        JuZi: "磨刀不误砍柴功"
    }

    onLoad () {
        //动态设置背景墙的高度
        let wall = cc.find("background/wall", this.node);
        wall.height = cc.winSize.height/2;
        this.initPageInfo(1, 1);
        this.loadTarget(this.abin);
        cc.log(this.xiangziNumber);
	}

    start () {
        
    }
	
    /**
     * 点击打卡机开门chuizi
     * @param e 
     */  

    getxiangzi(e: cc.Event.EventTouch){
        let xiangzi=null;
        if(this.xiangziNumber==0){
            this.abin.getComponent(cc.Sprite).spriteFrame = this.abinSmile;
            xiangzi =this.xiangzi;
            this.abin.children[0].active=true;
            this.abin.children[1].active=true;
            this.xianshi.children[6].active=false;
            this.xianshi.children[5].active=true;
        }
        else if(this.xiangziNumber==1){
            xiangzi =this.xiangzi2;
            this.xianshi.children[5].active=false;
            this.xianshi.children[4].active=true;
        }
        else{
            xiangzi =this.xiangzi3;
            this.xianshi.children[4].active=false;
            this.xianshi.children[3].active=true;
        }
        if(PropBar.Instance.propExist(xiangzi)){
            return; 
        }
        this.xiangziNumber++;
        let self =this;
        PropBar.Instance.addProp(xiangzi,function(){
            let dragBox=xiangzi.getComponent(DragBox);
            dragBox.node.removeComponent(cc.Button);
            dragBox.setInitPos(xiangzi.getPosition());
            dragBox.dragabled=true;
            if(self.xiangziNumber == 3){
                self.xiaomei.removeComponent(cc.Button);
                self.xiaomeibian();
            }
            dragBox.setReceiveCallback(self.dragReceiver_xiangzi.bind(self));
        });
    }
    
    dragReceiver_xiangzi(drag: DragBox, receiver: cc.Collider){
           if(this.abin2.childrenCount==0){
              this.abin2.active=true;
              this.abin.active=false;
           }
           this.xianshi.children[3-this.abin2.childrenCount].active=false;
           this.xianshi.children[2-this.abin2.childrenCount].active=true;
           drag.node.setPosition(5,-8+this.abin2.childrenCount*(drag.node.height-5));
           drag.node.parent=this.abin2;
           drag.dragabled=false;
           this.abinGetBox ++;
           if(this.abinGetBox==3){
              this.isSucceed=true;
              this.xiaomei.removeComponent(cc.Button);
           }
    }

    xiaomeibian(){
        var xiaomeibianAnim=this.xiaomei.getComponent(cc.Animation);
        var xiaomeibianAnimState=xiaomeibianAnim.play('xiaomeibian');
        xiaomeibianAnim.on('finished',this.changediantistate,this);
    }

    xiaomei2move(){
        this.xiaomei2.active=true;
        this.xiaomei.active=false;
        var xiaomeimoveAnim=this.xiaomei2.getComponent(cc.Animation);
        var xiaomeimoveAnimState=xiaomeimoveAnim.play('xiaomei2bian');
        xiaomeimoveAnim.on('finished',this.getsuccessed,this);
    }

    getsuccessed(){
        this.showLevelResult(false,2, "注孤生");
        GameInfo.Instance.unlockAchieved(this.levelNum, 2,false);
    }

    getdiantibutton(e: cc.Event.EventTouch){
        e.target.removeComponent(cc.Button);
        this.xianshi.removeComponent(cc.Button);
        cc.find("scene/scene_2/diantimen",this.node).removeComponent(cc.Button);
        if(this.isSucceed==false){
            e.target.removeComponent(cc.Button);
            if(this.isxiaomeimoved==true){
                this.xiaomei2move();      
            }
            else{
                this.showLevelResult(false,2, "注孤生");
                GameInfo.Instance.unlockAchieved(this.levelNum, 2,false);
            }

        }
        else{
            e.target.removeComponent(cc.Button); 
            this.animAbinmove();
        }

    }
    changediantistate(){
        this.isGetdianti=true;
        this.isxiaomeimoved=true;
    }

    getdianti(e: cc.Event.EventTouch){
        if(this.isGetdianti==true){
            cc.log('此门可开');
            if(this.isSucceed==true){
                e.target.removeComponent(cc.Button);
                this.animAbinmove();
            }
            else{
                e.target.removeComponent(cc.Button);
                this.xiaomei2move();
            }
        }
        else{
            this.showLevelResult(false,2, "注孤生");
            GameInfo.Instance.unlockAchieved(this.levelNum, 2,false);
        }
    }

    animAbinmove(){
        cc.log("播动画");
        var xiaomeiMoveAnim=this.xiaomei.getComponent(cc.Animation);
        var xiaomeiMoveAnimState=xiaomeiMoveAnim.play('xiaomeisuccessedmove');
        var aBinMoveAnim=this.abin2.getComponent(cc.Animation);
        var aBinMoveAnimState=aBinMoveAnim.play('abin2move');
        aBinMoveAnim.on('finished',this.diantimove,this);
    }

    diantimove(){
        AudioService.Instance.playEffect("电梯开门",false);
        var doorLeftAnim=this.left.getComponent(cc.Animation);
        var doorLeftAnimState=doorLeftAnim.play('door-left');
        var doorRightAnim=this.right.getComponent(cc.Animation);
        var doorRightAnimState=doorRightAnim.play('door-right');
        doorRightAnim.on('finished',this.tongguan,this);
    }

    tongguan(){
        this.showLevelResult(true,1,"官宣：我们");
        GameInfo.Instance.unlockAchieved(this.levelNum, 1,true);
    }
}
