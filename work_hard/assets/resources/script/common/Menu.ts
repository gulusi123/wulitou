import GameScene from "../GameScene";
import AudioService from "./AudioService";
import GameInfo from "./GameInfo";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Menu extends cc.Component {

    close(){
        let w = this.node.getChildByName("window");
        let a = cc.scaleTo(0.2, 0.2, 0.2);
        let self = this;
        let finished = cc.callFunc(()=>{
            self.node.active = false;
        })
        w.runAction(cc.sequence(a, finished));
    }
    show(){
        let w = this.node.getChildByName("window");
        w.setScale(0.2);
        this.node.active = true;
        let a = cc.scaleTo(0.2, 1, 1);
        w.runAction(a);
    }

    retry(){
        this.close();
        if(GameScene.Instance.level.levelNum == 22 && !GameInfo._22isRetry){
            GameInfo._22isRetry = true;
        }
        GameScene.Instance.retryLevel();
    }

    selectLevel() {
        this.close();
        GameScene.Instance.playBtnClick();
    }
}
