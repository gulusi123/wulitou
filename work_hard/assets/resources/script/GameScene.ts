const {ccclass, property} = cc._decorator;
import AudioService from "./common/AudioService";
import Loader from "./common/Loader";
import LevelInfo from "./common/LevelInfo";
import LevelResult from "./common/LevelResult";
import BaseLevel from "./common/BaseLevel";
import DragBox from "./common/DragBox";
import ReceiveProp from "./common/ReceiveProp";
import Menu from "./common/Menu";
import GameInfo from "./common/GameInfo";
import Tips from "./common/Tips";
import GameMgr from "./common/GameMgr";
import LevelBtn from "./common/LevelBtn";
import Achieved from "./common/Achieved";
@ccclass
export default class GameScene extends cc.Component {
    
    // @property(cc.Node)
    // menuNode: cc.Node = null;
    @property(cc.Node)
    selectNode: cc.Node = null;
    @property(cc.Node)
    levels: cc.Node = null;//所有关卡选择
    @property(cc.Node)
    levelScene: cc.Node = null;//关卡场景
    @property(cc.Node)
    previousBtn: cc.Node = null;//上一场景按钮
    @property(cc.Node)
    nextBtn: cc.Node = null;//下一场景按钮
    @property(cc.Prefab)
    resultPrefab: cc.Prefab = null;//关卡结果预制体
    @property(cc.Prefab)
    receivePropPrefab: cc.Prefab = null;//获取道具提示预制体
    @property(cc.Prefab)
    propBarPrefab: cc.Prefab = null;//道具栏预制体
    @property(cc.Prefab)
    menuPrefab: cc.Prefab = null;//菜单预制体
    @property(cc.Prefab)
    tipsPrefab: cc.Prefab = null;//提示预制体
    @property(cc.Prefab)
    clickPrefab: cc.Prefab = null;//点击效果预制体
    @property([cc.Sprite])
    gkSprite: cc.Sprite[] = [];
    @property(cc.SpriteAtlas)
    resAtlas: cc.SpriteAtlas = null;
    @property(cc.Node)
    achieved: cc.Node = null;
    @property(cc.Prefab)
    targetLable : cc.Prefab = null;//关卡目的
    @property(cc.Prefab)
    selectGKTip : cc.Prefab = null;//选卡选项提示
    @property(cc.Prefab)
    tipWindow : cc.Prefab = null;//特殊提示弹窗

    public level: BaseLevel = null;//当前关卡脚本对象
    private levelResult: LevelResult = null;//关卡结果弹窗脚本对象
    private receiveProp: ReceiveProp = null;//获取道具窗口
    private menu: Menu = null;
    private tips: Tips = null;
    private clickPool: cc.NodePool = new cc.NodePool("click");
    //大厅提示消息队列
    public tipQueue : Array<string> = [];

    public static Instance: GameScene = null;

    onLoad () {
        GameScene.Instance = this;
        this.selectNode.active = false;
        this.levelScene.active = false;
        //cc.systemEvent.setAccelerometerEnabled(true);
        //cc.systemEvent.setAccelerometerInterval(1);
        //cc.systemEvent.on(cc.SystemEvent.EventType.DEVICEMOTION, this.motionEvent, this);

        if(cc.sys.platform == cc.sys.ANDROID){
            //显示广告位
            let ggw = cc.find("ggw", this.levelScene);
            ggw.active = true;
            let topMenu = cc.find("top_menu", this.levelScene);
            let widget = topMenu.getComponent(cc.Widget);
            widget.top = 160;
            //this.schedule(this.showBannerAd.bind(this), 180, cc.macro.REPEAT_FOREVER, 5);
        }else{
            //不显示广告位
            let ggw = cc.find("ggw", this.levelScene);
            ggw.active = false;
            let topMenu = cc.find("top_menu", this.levelScene);
            let widget = topMenu.getComponent(cc.Widget);
            widget.top = 10;
        }
        this.registerLevelSceneTouch(true);
	}
    onDestroy() {
        //cc.systemEvent.off(cc.SystemEvent.EventType.DEVICEMOTION, this.motionEvent, this);
        this.registerLevelSceneTouch(false);
    }
    /**
     * 重力感应
     * @param event 
     */
    // motionEvent(event: any){
    //     if(event.acc.y >= 0.75 && event.acc.y <= 1){
    //         cc.log("正常竖屏");
    //     }else if(event.acc.y >= -1 && event.acc.y <= -0.75){
    //         cc.log("倒立竖屏");
    //     }else if(event.acc.x >= 0.75 && event.acc.x <= 1){
    //         cc.log("正常横屏");
    //     }else if(event.acc.x >= -1 && event.acc.x <= -0.75){
    //         cc.log("倒立横屏");
    //     }
    // }
    
    start () {
        this.initLevels();
    }
    
    registerLevelSceneTouch(register: boolean){
        if(register){
            this.levelScene.on(cc.Node.EventType.TOUCH_START, this.touchLevelScene, this);
        }else{
            this.levelScene.off(cc.Node.EventType.TOUCH_START, this.touchLevelScene, this);
        }
    }
    touchLevelScene(e: cc.Event.EventTouch){
        let click: cc.Node = null;
        if(this.clickPool.size() > 0){
            click = this.clickPool.get(this);
        }else{
            click = cc.instantiate(this.clickPrefab);
        }
        let pos = e.getLocation();
        click.setScale(0.1);
        click.setPosition(this.levelScene.convertToNodeSpaceAR(pos));
        this.levelScene.addChild(click);
        cc.tween(click).to(0.3, {scale: 0.4}).call(()=>{
            this.clickPool.put(click);
        }).start();
    }
    
    /**
     * 进入关卡选择
     */
    playBtnClick() {
        AudioService.Instance.resetGameAudio("bg1");
        //提示消息展示
        for(let i = 0 ; i < this.tipQueue.length ; i ++){
            this.createTipWindow(this.tipQueue.pop());
        }
        if(this.level != null && this.level.node != null){
            this.level.node.destroy();
        }
        this.refreshLevels();
        this.levelScene.active = false;
        // this.menuNode.active = false;
        this.achieved.active = false;
        this.selectNode.active = true;

        //绑定返回按钮事件为返回开始
        GameMgr.Instance.bindBackEvent(this.backBtnClick.bind(this));
    }

    /**
     * 返回开始
     */
    backBtnClick() {
        //this.selectNode.active = false;
        // this.menuNode.active = true;
        //绑定返回按钮事件为空
        cc.director.loadScene("InitScene");
        AudioService.Instance.changeMusicState();
        GameMgr.Instance.bindBackEvent(null);
    }
    /**
     * 初始化选择关卡
     */
    initLevels() {
        let self = this;
        Loader.Instance.loadRes("prefab/common/LevelBtn", function(err: Error, res: cc.Prefab){
            if(!err){
                for(let i=0; i<GameInfo.Total_Level; i++){
                    // if(GameInfo.LevelPrefab[i+1] != ""){
                    //     GameInfo.Instance.unlockLevel(i + 1);
                    // }
                    let levelBtn = cc.instantiate(res);
                    let levelBtnScript = levelBtn.getComponent(LevelBtn);
                    let cols = Math.floor(self.levels.width/(levelBtn.width * 1.2));//每行按钮个数
                    // let cols = 4;
                    let intervalX = Math.floor((self.levels.width - cols * levelBtn.width)/(cols-1));//每个按钮x轴的间隔
                    levelBtn.x = -self.levels.width/2 + levelBtn.width/2 + (i % cols) * (levelBtn.width + intervalX);
                    levelBtn.y = self.levels.height/2 - levelBtn.height/2 - Math.floor(i/cols) * levelBtn.height * 1.2;
                    let btn = levelBtn.getComponent(cc.Button);
                    let btnEvent = new cc.Component.EventHandler();
                    btnEvent.target = self.node; 
                    btnEvent.component = "GameScene";
                    btnEvent.handler = "levelBtnClick";
                    btnEvent.customEventData = (i + 1) + "";
                    btn.clickEvents.push(btnEvent);

                    levelBtnScript.initLevelBtn(i + 1);

                    self.levels.addChild(levelBtn);
                    
                }
                self.playBtnClick();
            }
        }, this.node);
    }
    /**
     * 刷新关卡信息
     */
    refreshLevels(){
        for(let node of this.levels.children){
            let levelBtn = node.getComponent(LevelBtn);
            levelBtn.initLevelBtn(levelBtn.levelNum);
        }
        if(this.level != null){
            let levelBtn = this.levels.children[this.level.levelNum-1].getComponent(LevelBtn);
            levelBtn.selectBtn();
        }
    }
    levelBtnClick(e: cc.Event.EventTouch, data: string){
        let level = Number(data);
        if(GameInfo.Instance.isLock(level)){
            this.createGkTip(level);
            //关卡锁定返回
            return;
        }

        //上一个选择的关卡去掉
        if(this.level != null){
            let levelBtn = this.levels.children[this.level.levelNum-1].getComponent(LevelBtn);
            levelBtn.unselectBtn();
        }

        let levelBtn: cc.Node = e.target;
        let levelBtnScript = levelBtn.getComponent(LevelBtn);
        levelBtnScript.selectBtn();
        this.selectLevel(level);
    }
    
    /**
     * 创建关卡提示信息
     * @param level 
     */
    createGkTip(level : number){
        let tipContent = "";
        if(level<= 22){
            tipContent = "需要通关前面关卡哦";
        }else if(level == 23){
            tipContent = "需要完成全部成就才能解锁哦";
        }else{
            tipContent = "需收集到星星并解锁23关哦";
        }
        let tipLable = cc.instantiate(this.selectGKTip);
        tipLable.getComponent(cc.Label).string = tipContent;
        tipLable.parent = this.node;
        cc.tween(tipLable).to(0.3,{y:30})
        .delay(0.5)
        .to(0.5,{opacity : 0,y : 80})
        .call(function(){
            tipLable.destroy();
        })
        .start();
    }

    /**
     * 选择关卡
     * @param levelNum 
     */
    selectLevel(levelNum: number) {
        if(levelNum >= GameInfo.LevelPrefab.length){
            levelNum = 1;
        }
        let self = this;
        if(GameInfo.LevelPrefab[levelNum] == ""){
            return;
        }
        //加载关卡预制资源
        Loader.Instance.loadRes("prefab/levels/" + GameInfo.LevelPrefab[levelNum], function(err: Error, res: cc.Prefab){
            if(!err){
                //显示关卡
                if(self.level != null && self.level.isValid){
                    self.level.node.destroy();
                }
                cc.audioEngine.stopAllEffects();
                AudioService.Instance.playMusic(GameInfo.LevelBg[levelNum],true);
                // self.menuNode.active = false;
                self.selectNode.active = false;
                self.levelScene.active = true;
                self.achieved.active = false;

                let node = cc.instantiate(res);
                node.width = self.levelScene.width;
                node.height = self.levelScene.height;
                self.level = node.getComponent(BaseLevel);
                self.level.initBaseLevel(levelNum, self);
                self.level.initPageBtn(self.previousBtn, self.nextBtn);

                //设置关卡图片文字
                if(levelNum >= 10){
                    self.gkSprite[1].node.active = true;
                    self.gkSprite[1].spriteFrame = self.resAtlas.getSpriteFrame("gk-" + (levelNum % 10));
                    self.gkSprite[0].spriteFrame = self.resAtlas.getSpriteFrame("gk-" + Math.floor(levelNum/10));
                }else{
                    self.gkSprite[1].node.active = false;
                    self.gkSprite[0].spriteFrame = self.resAtlas.getSpriteFrame("gk-" + levelNum);
                }

                self.levelScene.insertChild(node, 0);

                //绑定返回按钮事件为选择关卡
                GameMgr.Instance.bindBackEvent(self.playBtnClick.bind(self));
            }else{
                cc.log(err);
                cc.log("关卡" + levelNum + "资源加载失败");
            }
        }, this.node);
    }

    /**
     * 显示游戏结果窗口
     * @param isWin 
     * @param result    图片编号
     * @param text 
     */
    showLevelResult(isWin: boolean, result: number, text: string){
        if(this.levelResult == null){
            let node = cc.instantiate(this.resultPrefab);
            this.levelResult = node.getComponent(LevelResult);
            this.levelResult.setResultCallback(this.retryLevel.bind(this), this.playBtnClick.bind(this), this.nextLevel.bind(this));
            this.node.addChild(node);
        }
        this.levelResult.setResultInfo(isWin, this.level.levelNum + "-" + result, text);
        AudioService.Instance.playEffect(isWin?"success":"fail",false,function(handle : any){
            AudioService.Instance.changeMusicState();
        },true);
        this.levelResult.show();
        if(isWin){
            //解锁下一关卡
            GameInfo.Instance.unlockLevel(this.level.levelNum + 1);
        }
    }
    /**
     * 显示菜单窗口
     */
    showMenu(){
        AudioService.Instance.playEffect("游戏按钮",false);
        if(this.menu == null){
            let node = cc.instantiate(this.menuPrefab);
            this.menu = node.getComponent(Menu);
            this.node.addChild(node);
        }
        this.menu.show();
    }
    /**
     * 显示提示窗口
     */
    shosTips(){
        if(this.level.levelNum >= 23){
            return;
        }
        if(this.tips == null){
            let node = cc.instantiate(this.tipsPrefab);
            this.tips = node.getComponent(Tips);
            this.node.addChild(node);
        }
        this.tips.initTips(this.level.levelNum);
        this.tips.show();
    }
    /**
     * 重玩
     */
    retryLevel(){
        this.selectLevel(this.level.levelNum);
    }
    /**
     * 下一关
     */
    nextLevel() {
        //下一关卡未解锁,返回关卡选择界面
        if(GameInfo.Instance.isLock(this.level.levelNum + 1)){
            this.playBtnClick();
            return;
        }
        this.selectLevel(this.level.levelNum + 1);
    }

    /**
     * 显示获取道具
     */
    showReceiveProp(drag: DragBox){
        if(this.receiveProp == null){
            let node = cc.instantiate(this.receivePropPrefab);
            this.receiveProp = node.getComponent(ReceiveProp);
            this.node.addChild(node);
        }
        this.receiveProp.showWindow(drag, this.level);
    }

    previousScene(){
        this.level.previousScene();
    }

    nextScene(){
        this.level.nextScene();
    }

    showBannerAd(){
        if(cc.sys.platform == cc.sys.ANDROID){
            if(window["banner"] == null){
                let self = this;
                window["banner"] = {
                    preloadError: function(code: number, msg: string){
                        cc.log("预加载错误" + code + "-->" + msg);
                    },
                    preloadSuccess: function(id: string){
                        cc.log("preloadSuccess-->" + id);
                    },
                    onShow: function(){
                        cc.log("onShow-->");
                    }
                };
            }
            //显示Banner广告
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/SdkApi", "showNativeBannerAd", "(II)V", cc.winSize.width, 150);
        }else{
            cc.log("非android环境，不加载广告");
        }
    }

    /**
     * 显示成就
     */
    showAchieved(){
        this.levelScene.active = false;
        // this.menuNode.active = false;
        this.selectNode.active = false;
        this.achieved.active = true;
        //绑定返回按钮事件为返回开始
        GameMgr.Instance.bindBackEvent(this.playBtnClick.bind(this));
    }

    /**
     * 创建提示弹窗
     */
    createTipWindow(content ?: string){
        let tipWindow_node = cc.instantiate(this.tipWindow);
        tipWindow_node.parent = this.node;
        let tipbg = tipWindow_node.getChildByName("tipbg");
        tipbg.scale = 0.5;
        cc.tween(tipbg).to(0.2,{scale : 1}).start();
        let btn = tipWindow_node.getComponent(cc.Button);
        let handler = new cc.Component.EventHandler();
        handler.target = this.node;
        handler.component = "GameScene";
        handler.handler = "tipWindowCallBack";
        btn.clickEvents.push(handler);
    }

    tipWindowCallBack(e : cc.Event.EventTouch){
        let tipWindow_node = e.target;
        tipWindow_node.active = false;
        tipWindow_node.destroy();
    }
}