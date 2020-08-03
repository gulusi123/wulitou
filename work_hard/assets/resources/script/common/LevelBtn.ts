import GameInfo from "./GameInfo";

const {ccclass, property} = cc._decorator;

@ccclass
export default class LevelBtn extends cc.Component {

    @property(cc.Sprite)
    progress: cc.Sprite = null;
    @property(cc.Node)
    lock: cc.Node = null;
    @property(cc.SpriteAtlas)
    resAtlas: cc.SpriteAtlas = null;
    @property(cc.Label)
    levelLabel: cc.Label = null;

    public levelNum = 0;
    private unlockColor = new cc.Color(177, 146, 119, 255);
    private lockColor = new cc.Color(146, 146, 146, 255);
    private selectColor = new cc.Color(187, 115, 56, 255);
    onLoad () {
		
	}

    start () {

    }
    
    initLevelBtn(levelNum: number){
        this.levelNum = levelNum;
        let isLock = GameInfo.Instance.isLock(levelNum);
        if(isLock){
            this.levelLabel.node.color = this.lockColor;
            this.lock.active = true;
            this.node.getComponent(cc.Sprite).spriteFrame = this.resAtlas.getSpriteFrame("guankadi3");
            this.progress.node.parent.active = false;
        }else{
            this.levelLabel.node.color = this.unlockColor;
            this.lock.active = false;
            this.node.getComponent(cc.Sprite).spriteFrame = this.resAtlas.getSpriteFrame(levelNum >=23 ?"guankadi4": "guankadi1");
            if(levelNum <= 22){
                this.progress.node.parent.active = true;
            }else{
                this.progress.node.parent.active = false;
            }
            let ps = GameInfo.Instance.getAchievedProgress(levelNum);
            this.progress.fillRange = -ps;
        }
        this.levelLabel.string = levelNum + "";
    }

    selectBtn(){
        let isLock = GameInfo.Instance.isLock(this.levelNum);
        if(isLock){
            return;
        }
        if(this.levelNum <= 22){
            this.levelLabel.node.color = this.selectColor;
            this.node.getComponent(cc.Sprite).spriteFrame = this.resAtlas.getSpriteFrame("guankadi2");
            this.progress.spriteFrame = this.resAtlas.getSpriteFrame("select_yuan");
            this.progress.node.parent.getComponent(cc.Sprite).spriteFrame = this.resAtlas.getSpriteFrame("select_di");
        }else{
            this.progress.node.parent.active = false;
            this.node.getComponent(cc.Sprite).spriteFrame = this.resAtlas.getSpriteFrame("guankadi5");
        }
    }

    unselectBtn(){
        let isLock = GameInfo.Instance.isLock(this.levelNum);
        if(isLock){
            this.levelLabel.node.color = this.lockColor;
            this.lock.active = true;
            this.node.getComponent(cc.Sprite).spriteFrame = this.resAtlas.getSpriteFrame("guankadi3");
            this.progress.node.parent.active = false;
        }else{
            this.levelLabel.node.color = this.unlockColor;
            this.lock.active = false;
            if(this.levelNum <= 22){
                this.node.getComponent(cc.Sprite).spriteFrame = this.resAtlas.getSpriteFrame("guankadi1");
                this.progress.node.parent.active = true;
                this.progress.spriteFrame = this.resAtlas.getSpriteFrame("yuan1");
                this.progress.node.parent.getComponent(cc.Sprite).spriteFrame = this.resAtlas.getSpriteFrame("yuan2di");
            }else{
                this.node.getComponent(cc.Sprite).spriteFrame = this.resAtlas.getSpriteFrame("guankadi4");
            }
        }
    }
}
