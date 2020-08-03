const {ccclass, property} = cc._decorator;
import AudioService from "./common/AudioService";
@ccclass
export default class InitScene extends cc.Component {

    @property(cc.Button)
    playBtn: cc.Button = null;
    @property(cc.Node)
    progressNode: cc.Node = null;
    @property(cc.Label)
    plabel: cc.Label = null;
    @property(cc.VideoPlayer)
    startVideo : cc.VideoPlayer = null;
    @property(cc.Node)
    backGround : cc.Node = null

    onLoad () {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.keyDown, this);
	}
    
    start () {
        // this.startVideo.node.width = cc.winSize.width;
        // this.startVideo.node.height = cc.winSize.height;
        // this.startVideo.node.on('ready-to-play', this.vedioPlayCallBack, this);
        // this.startVideo.node.on('completed', this.completedPlay, this);


        this.startVideo.node.active = false;
        this.backGround.active = true;
        this.loadGameScene();
    }

    vedioPlayCallBack(){
        this.startVideo.play();
    }

    completedPlay(){
        this.startVideo.node.active = false;
        this.backGround.active = true;
        this.loadGameScene();   
    }
    
	onDestroy() {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.keyDown, this);
    }
    private keyDown(event: cc.Event.EventKeyboard) {
        if(event.keyCode == cc.macro.KEY.back){
            cc.game.end();
        }
    }
    /**
     * 加载菜单场景
     */
    loadGameScene(){
        cc.loader.loadRes("scene/GameScene", cc.SceneAsset, this.loadGameSceneProcess.bind(this), this.loadGameSceneCompleted.bind(this));
    }
    loadGameSceneProcess(completedCount: number, totalCount: number, item: any){
        //加载进度
        let process = (completedCount / totalCount * 100).toFixed(2);
        this.plabel.string = process + "%";
        let w = (this.progressNode.parent.width - 8) * Number(process)/100;
        this.progressNode.width = w;
    }
    loadGameSceneCompleted(error: Error, resource: cc.SceneAsset){
        if(!error){
            this.scheduleOnce(()=>{
                this.progressNode.parent.active = false;
                this.playBtn.node.active = true;
            }, 0.3);
        }
    }
    intoGameScene(){
        cc.director.loadScene("GameScene");
        //AudioService.Instance.resetGameAudio();        
    }
}
