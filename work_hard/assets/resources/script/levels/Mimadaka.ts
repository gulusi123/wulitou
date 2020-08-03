import BaseLevel from "../common/BaseLevel";
import PropBar from "../common/PropBar";
import DragBox from "../common/DragBox";
import GameInfo from "../common/GameInfo";
import GameScene from "../GameScene";
import AudioService from "../common/AudioService";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Mimadaka extends BaseLevel {

    @property(cc.Node)
    abin: cc.Node = null;
    @property(cc.SpriteFrame)
    abin_getPhone : cc.SpriteFrame = null;
    @property(cc.Node)
    door: cc.Node = null;
    @property(cc.Node)
    phone : cc.Node = null;
    @property(cc.Label)
    mainPwd : cc.Label = null;
    @property(cc.Node)
    filePwd_input : cc.Node = null;
    @property(cc.Label)
    dkjPwd : cc.Label = null;
    @property(cc.Label)
    inputTip : cc.Label = null;

    @property(cc.SpriteFrame)
    hatColor : Array<cc.SpriteFrame> = [];
    //手机当前节点
    private phoneCurrentNode : cc.Node = null;
    //文件密码输入框起始位置
    private filePwdInput_index  = 0;

    private phonePassword = "2461";
    private filePassword = "1035";
    private abinPwd = "1314";
    private xiaomeiPwd = "0215";
    private fileInputPwd = "";
    private hatIndex = 0;

    onLoad () {
        let nodes = this.sceneNode.children;
        for(let i=0; i<nodes.length; i++){
            nodes[i].x = i * cc.winSize.width;
            nodes[i].y = 0;
        }

        //动态设置背景墙的高度
        let wall = cc.find("background/wall", this.node);
        wall.height = cc.winSize.height/2;
        
        this.initPageInfo(1, 2);
        this.loadTarget(this.abin);
        this.phoneCurrentNode = cc.find("phone/telPhone/main",this.node);
        //this.initKeyboard();
        //this.initWifiPswd();
        
	}

    start () {

    }
    
    
    phonePwdBtnClick(e : cc.Event.EventTouch , num : number){
        if(this.mainPwd.string == "输入密码"){
            this.mainPwd.string = "";
        }
        if(this.mainPwd.string.length == 4){
            return;
        }
        this.mainPwd.string = this.mainPwd.string + num;
        if(this.mainPwd.string.length >= 1){
            cc.find("phone/telPhone/secret/back",this.node).active = true;
        }
        if(this.mainPwd.string.length == 4){
            this.checkPhonePwd();
        }
    }
    
    phonePwdBack(){
        let pwd = this.mainPwd.string;
        if(pwd != ""){
           this.mainPwd.string = "";
        }
        if(this.mainPwd.string.length == 0){
            this.mainPwd.string = "输入密码";
            cc.find("phone/telPhone/secret/back",this.node).active = false;
        }
    }
    
    checkPhonePwd(){
       this.scheduleOnce(function(){
           let secret = cc.find("phone/telPhone/secret",this.node);
            if(this.mainPwd.string ==  this.phonePassword ){
                secret.active = false;
                this.mainPwd.string = "";
                secret.getChildByName("back").active = false;
            }else{
                let anim = secret.getChildByName("main_pwd").getComponent(cc.Animation);
                anim.play("errorPhonePwd");
            }
       }.bind(this),0.2)
    }
    
    //打卡机按钮点击
    dkjNumBtnClick(e : cc.Event.EventTouch , str : string){
        if(this.dkjPwd.string == ""){
            cc.find("scene/scene_1/dkj_big/tip",this.node).active = false;
        }
        if(this.dkjPwd.string.length == 4){
            return;
        }
        this.dkjPwd.string = this.dkjPwd.string + str;
        if(this.dkjPwd.string.length == 4){
            this.checkDkjPwd();
        }
    }
    
    checkDkjPwd(){
        let self = this;
        self.changePlayerEvent();
        this.scheduleOnce(function(){
            let input = self.dkjPwd.string;
            if(input == self.abinPwd){
                self.dakaCallBack("阿斌打卡成功",function(){
                    self.changesmall();
                    self.dakaSuccess();
                });
            }else if(input == self.xiaomeiPwd){
                self.dakaCallBack("小美打卡成功",function(){
                    self.changesmall();
                    self.inputTip.node.active = false;
                    GameInfo.Instance.unlockAchieved(self.levelNum, 2,false);
                    self.showLevelResult(false,2,"好人卡:小美打卡成功");
                });
            }else{
                self.dakaCallBack("打卡失败",function(){
                    self.changesmall();
                    self.showLevelResult(false,0,"驴的记忆");
                })
            }
        }.bind(this),0.2);
    }
    
    dakaCallBack(str :string, callBack : Function ){
        this.dkjPwd.node.active = false;
        this.inputTip.string = str;
        this.inputTip.node.active = true;
        cc.tween(this.inputTip.node)
            .to(0.2,{scale : 1.1})
            .to(0.3,{scale : 0.8})
            .to(0.3,{scale : 1})
            .call(callBack)
            .start();
    }

    dakaSuccess(){
        AudioService.Instance.playEffect("自动门打开",false);
        let doorLeft_anim = this.door.getChildByName("mask").getChildByName("door_left").getComponent(cc.Animation);
        doorLeft_anim.play("door_left");
        let doorRight_anim = this.door.getChildByName("mask").getChildByName("door_right").getComponent(cc.Animation);
        doorRight_anim.play("door_right");
        let self = this;
        doorRight_anim.on("finished",()=>{
            let abinMove_anim = self.abin.getComponent(cc.Animation);
            abinMove_anim.play("abinMove");
            abinMove_anim.on("finished",function(){
                GameInfo.Instance.unlockAchieved(self.levelNum, 1,true);
                self.showLevelResult(true,1,"你闻到酸味了吗？")
                
            }.bind(self));
        });
    }

    transprotHat(){
        this.unschedule(this.hatCallBack);//取消上一次的定时任务
        if(this.hatIndex == 4){
            this.hatIndex = 0;
        }else{
            this.hatIndex ++;
        }
        this.abin.getChildByName("hat").getComponent(cc.Sprite).spriteFrame = this.hatColor[this.hatIndex];
        this.scheduleOnce(this.hatCallBack,1);
    }
    
    hatCallBack(){
        if(this.hatIndex > 0){
            this.abin.getChildByName("hat").getComponent(cc.Button).interactable = false;
            let hatCallBack =  this.abin.getChildByName("hatCallBack");
            let tip = hatCallBack.getChildByName("index_" + this.hatIndex);
            tip.active = true;
            hatCallBack.active = true;
            cc.tween(hatCallBack)
            .to(1,{opacity : 255})
            .delay(2)
            .to(1,{opacity : 0})
            .call(function(){
                hatCallBack.active = false;
                tip.active = false;
                this.abin.getChildByName("hat").getComponent(cc.Button).interactable = true;
            }.bind(this))
            .start();
        }
    }

    buttonClick(e : cc.Event.EventTouch,str : string){
        let target = e.target;
        switch(str){
            case "xiaomei":
                target.getComponent(cc.Button).interactable = false;
                let talk = target.getChildByName("talk");
                cc.tween(talk)
                  .to(1.5,{opacity : 255})
                  .delay(2)
                  .to(1.5,{opacity : 0})
                  .call(function(){
                    target.getComponent(cc.Button).interactable = true;
                  }.bind(this))
                  .start();
                break;
            case "dapeng":
                target.getComponent(cc.Button).interactable = false;
                let talk1 = target.getChildByName("talk");
                cc.tween(talk1)
                  .to(1.5,{opacity : 255})
                  .delay(2)
                  .to(1.5,{opacity : 0})
                  .call(function(){
                    target.getComponent(cc.Button).interactable = true;
                  }.bind(this))
                  .start();
                break;
            case "open":
                this.changePlayerEvent();
                this.phone.active = true;
                break;
            case "close":
                this.changePlayerEvent();
                this.mainPwd.string = "输入密码";
                cc.find("phone/telPhone/secret/back",this.node).active = false;
                this.phone.active = false;
                let zhuye = cc.find("phone/telPhone/main",this.node);
                if(this.phoneCurrentNode != zhuye){
                    this.phoneCurrentNode.active = false;
                    this.phoneCurrentNode = zhuye;
                    zhuye.active = true;
                }
                cc.find("phone/telPhone/secret",this.node).active = true;
                this.clearFilePwd();
                break;
            case "hat":
                this.transprotHat();
                break;
            case "wps":
                let wps_content = cc.find("phone/telPhone/wps_content",this.node);
                this.phoneCurrentNode = wps_content;
                wps_content.active = true;
                cc.find("phone/telPhone/main",this.node).active = false;
                break;
            case "backHome":
                this.phoneCurrentNode.active = false;
                let filePwd = cc.find("phone/telPhone/file_pwd",this.node);
                if(this.phoneCurrentNode == filePwd){
                    this.clearFilePwd();
                }
                let main = cc.find("phone/telPhone/main",this.node);
                this.phoneCurrentNode = main;
                main.active = true;
                break;
            case "fileOpen":
                this.phoneCurrentNode.active = false;
                let file_pwd = cc.find("phone/telPhone/file_pwd",this.node);
                this.phoneCurrentNode = file_pwd;
                file_pwd.active = true;
                break;
        }
    }
    
    filePwdBtnClick(e : cc.Event.EventTouch , num : number){
        if(this.filePwdInput_index + 1 > 4){
            return;
        }
        this.filePwdInput_index ++;
        let input = this.filePwd_input.getChildByName("input" + this.filePwdInput_index);
        let number = input.getChildByName("number");
        number.getComponent(cc.Label).string = num + "";
        this.fileInputPwd = this.fileInputPwd + num + "";
    }
    
    clearFilePwd(){
        this.fileInputPwd = "";
        let children = this.filePwd_input.children;
        for(let i = 0 ; i < children.length ; i ++){
            children[i].getChildByName("number").getComponent(cc.Label).string = "";
        }
        this.filePwdInput_index = 0;
        let tip = cc.find("phone/telPhone/file_pwd/errorTip",this.node);
        tip.getComponent(cc.Label).string = "";
        tip.active = false;
    }

    filePwdBack(e : cc.Event.EventTouch){
        if(this.filePwdInput_index == 0){
            return;
        }
        let input = this.filePwd_input.getChildByName("input" + this.filePwdInput_index);
        let number = input.getChildByName("number");
        number.getComponent(cc.Label).string = "";
        this.filePwdInput_index --;
        this.fileInputPwd = this.fileInputPwd.substr(0,this.fileInputPwd.length -1);
    }
    
    filePwdOk(e : cc.Event.EventTouch){
        if(this.fileInputPwd == this.filePassword){
            this.clearFilePwd();
            this.phoneCurrentNode.active = false;
            let encrypt_content = cc.find("phone/telPhone/encrypt_content",this.node);
            this.phoneCurrentNode = encrypt_content;
            encrypt_content.active = true;
        }else{
            let tip = cc.find("phone/telPhone/file_pwd/errorTip",this.node);
            tip.active = true;
            let tipStr = "";
            if(this.fileInputPwd.length < 4){
                tipStr = "密码不全";
            }else{
                tipStr = "密码错误";
            }
            tip.getComponent(cc.Label).string = tipStr;
        }
    }
    
    prop_collect(e: cc.Event.EventTouch){
        e.target.removeComponent(cc.Button);
        e.target.active = false;
        let prop = cc.find("scene/scene_2/xiaomei/shouji",this.node);
        prop.active = true;
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
    }
    

    /**
     * 道具接收
     * @param drag 
     * @param receiver 
     */
    dragReceiver(drag: DragBox, receiver: cc.Collider){
        let tag_prop = drag.tag;
        if(receiver.tag == 2){
            PropBar.Instance.removeProp(drag.node);
            drag.dragabled = false;
            drag.node.active = false;
            this.abin.getComponent(cc.Sprite).spriteFrame = this.abin_getPhone;
            this.abin.x = -230;
            this.abin.getChildByName("hat").x = this.abin.getChildByName("hat").x -2;
            this.abin.getChildByName("hatCallBack").x = this.abin.getChildByName("hatCallBack").x -2;
            this.abin.getChildByName("phoneBtn").getComponent(cc.Button).interactable = true;
        }else{
            drag.returnInitPos();
        }
    }
    
    changebigger(e : cc.Event.EventTouch){
        let dkj =  cc.find("scene/scene_1/dkj_small",this.node);
        dkj.active = false;
        let cameraNode = cc.find("Main Camera",cc.Canvas.instance.node);
        let camera = cameraNode.getComponent(cc.Camera);
        camera.zoomRatio = 4;
        cameraNode.setPosition(dkj.getPosition());
    }
    
    changesmall(){
        cc.find("scene/scene_1/dkj_small",this.node).active = true;
        cc.find("scene/scene_1/dkj_big/tip",this.node).active = true;
        this.dkjPwd.string = "";
        let cameraNode = cc.find("Main Camera",cc.Canvas.instance.node);
        let camera = cameraNode.getComponent(cc.Camera);
        camera.zoomRatio = 1;
        cameraNode.setPosition(cc.v2(0,0));
    }
    
}
