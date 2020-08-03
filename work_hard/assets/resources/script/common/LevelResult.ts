const {ccclass, property} = cc._decorator;

@ccclass
export default class LevelResult extends cc.Component {


    @property(cc.SpriteAtlas)
    imgRes: cc.SpriteAtlas = null;
    @property(cc.SpriteAtlas)
    resultRes: cc.SpriteAtlas = null;
    @property(cc.Node)
    sucessNode: cc.Node = null;
    @property(cc.Node)
    failNode: cc.Node = null;
    @property(cc.Sprite)
    resultText: cc.Sprite = null;
    @property(cc.Sprite)
    resultImg: cc.Sprite = null;
    @property(cc.Sprite)
    nextBtn: cc.Sprite = null;
    @property(cc.Sprite)
    othertBtn: cc.Sprite = null;
    @property(cc.Label)
    text: cc.Label = null;//结果成就文字

    private retryLevel: ()=>any = null;
    private otherLevel: ()=>any = null;
    private nextLevel: ()=>any = null;

    private isWin = false;
    onLoad () {
		this.text.enableWrapText = true;
	}

    start () {

    }
    show() {
        let w = this.node.getChildByName("window");
        w.setScale(0.2);
        this.node.active = true;
        cc.tween(w).to(0.2, {scale: 1}).call(()=>{
            let xiantiaoAnim = cc.find("xiantiao", this.failNode).getComponent(cc.Animation);
            xiantiaoAnim.play("level_result0");
        }).start();
    }
    close() {
        let w = this.node.getChildByName("window");
        let a = cc.scaleTo(0.2, 0.2, 0.2);
        let self = this;
        let finished = cc.callFunc(()=>{
            self.node.active = false;
        })
        w.runAction(cc.sequence(a, finished));
    }
    setResultCallback(retryLevel: ()=>any, otherLevel: ()=>any, nextLevel: ()=>any){
        this.retryLevel = retryLevel;
        this.otherLevel = otherLevel;
        this.nextLevel = nextLevel;
    }
    setResultInfo(isWin: boolean, img: string, text: string){
        let spriteFrame = this.resultRes.getSpriteFrame(img);
        this.isWin = isWin;
        if(isWin){
            if(spriteFrame == null){
                spriteFrame = this.imgRes.getSpriteFrame("daka");
            }
            this.sucessNode.active = true;
            this.failNode.active = false;
            this.resultText.spriteFrame = this.imgRes.getSpriteFrame("zi");
            this.othertBtn.node.active = false;
            this.nextBtn.node.active = true;
        }else{
            if(spriteFrame == null){
                spriteFrame = this.imgRes.getSpriteFrame("daka2");
            }
            this.sucessNode.active = false;
            this.failNode.active = true;
            this.resultText.spriteFrame = this.imgRes.getSpriteFrame("zi2");
            this.nextBtn.node.active = false;
            this.othertBtn.node.active = true;
        }
        this.resultImg.spriteFrame = spriteFrame;
        this.text.string = text;
    }
    btnClick(event: cc.Event.EventTouch){
        this.close();
        let btnName = event.target.name;
        if(btnName == "retry_btn" && this.retryLevel != null){
            this.retryLevel();
        }else if(btnName == "other_btn" && this.otherLevel != null){
            this.otherLevel();
        }else if(btnName == "next_btn" && this.nextLevel != null){
            this.nextLevel();
        }
    }
}
