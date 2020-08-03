const {ccclass, property} = cc._decorator;
import GameScene from "../GameScene";
import GameInfo from "./GameInfo";
@ccclass
export default class BaseLevel extends cc.Component {

    @property(cc.Node)
    sceneNode: cc.Node = null;
   
    public previousBtn: cc.Node = null;
    public nextBtn: cc.Node = null;

    private gameScene: GameScene = null;
    /**
     * 当前关卡
     */
    public levelNum: number = 0;

    private playerEvent = false;//玩家操作事件

    public pageIndex = 0;
    public totalPage = 2;
    
    //加载关卡目标
    loadTarget(abin : cc.Node){
        if(abin == null){
            return;
        }
        if(GameInfo.LevelTarget[this.levelNum] == ""){
            return;
        }
        let targetLable = cc.instantiate(GameScene.Instance.targetLable);
        targetLable.getChildByName("content").getComponent(cc.Label).string = GameInfo.LevelTarget[this.levelNum];
        targetLable.parent = abin;
        targetLable.setPosition(0,abin.height/2 + targetLable.height/2 + 20);
        this.scheduleOnce(function(){
            cc.tween(targetLable).to(1.5,{opacity:0}).start();
        }.bind(this),3);
    }

    /**
     * 是否有玩家操作事件
     */
    isPlayerEvent(){
        return this.playerEvent;
    }
    /**
     * 改变玩家操作事件状态
     */
    changePlayerEvent(){
        
        if(this.playerEvent){
            this.playerEvent = false;
        }else{
            this.playerEvent = true;
        }
    }
    initPageInfo(currentPage: number, totalPage: number){
        //添加道具栏
        let propBar = cc.instantiate(this.gameScene.propBarPrefab);
        this.node.addChild(propBar);
        let nodes = this.sceneNode.children;
        for(let i=0; i<nodes.length; i++){
            nodes[i].x = i * cc.winSize.width;
            nodes[i].y = 0;
        }
        this.totalPage = totalPage;
        this.pageIndex = currentPage - 1;
        this.sceneNode.x = -this.pageIndex * this.node.width;
        if(this.pageIndex > 0){
            this.previousBtn.active = true;
        }else{
            this.previousBtn.active = false;
        }
        if(this.pageIndex < this.totalPage - 1){
            this.nextBtn.active = true;
        }else{
            this.nextBtn.active = false;
        }
    }
    initBaseLevel (levelNum: number, gameScene: GameScene) {
        this.levelNum = levelNum;
        this.gameScene = gameScene;
    }
    initPageBtn(previousBtn: cc.Node, nextBtn: cc.Node){
        this.previousBtn = previousBtn;
        this.nextBtn = nextBtn;
    }
    /**
     * 显示结果
     * @param isWin     是否胜利
     * @param result    成就结果图编号
     * @param text      文字
     */
    showLevelResult(isWin: boolean, result: number, text: string) {
        if(this.gameScene != null){
            this.gameScene.showLevelResult(isWin, result, text);
        }
    }

    /**
     * 上一场景
     */
    previousScene(time?:number){
        if(this.isPlayerEvent()){
            return;
        }
        this.changePlayerEvent();
        this.pageIndex--;
        if(this.pageIndex < 0){
            this.pageIndex = 0;
            return;
        }
        let self = this;
        let action = cc.moveTo(time?time:0.5, cc.v2(-this.pageIndex * this.node.width, 0));
        let finish = cc.callFunc(()=>{
            if(self.pageIndex == 0){
                self.previousBtn.active = false;
            }
            self.nextBtn.active = true;
            self.changePlayerEvent();
            if(typeof(self["sceneChange"]) == "function"){
                self["sceneChange"](1, self.pageIndex);
            }
        });
        this.sceneNode.runAction(cc.sequence(action, finish));
    }
    /**
     * 下一场景
     */
    nextScene(time?:number){
        if(this.isPlayerEvent()){
            return;
        }
        this.changePlayerEvent();
        this.pageIndex++;
        if(this.pageIndex >= this.totalPage){
            this.pageIndex = this.totalPage - 1;
            return;
        }
        let self = this;
        let action = cc.moveTo(time?time:0.5, cc.v2(-this.pageIndex * this.node.width, 0));
        let finish = cc.callFunc(()=>{
            if(self.pageIndex == self.totalPage - 1){
                self.nextBtn.active = false;
            }
            self.previousBtn.active = true;
            self.changePlayerEvent();
            if(typeof(self["sceneChange"]) == "function"){
                self["sceneChange"](2, self.pageIndex);
            }
        });
        this.sceneNode.runAction(cc.sequence(action, finish));
    }

    hasPreviousScene(){
        return this.pageIndex > 0;
    }

    hasNextScene(){
        return this.pageIndex < this.totalPage - 1;
    }
}
