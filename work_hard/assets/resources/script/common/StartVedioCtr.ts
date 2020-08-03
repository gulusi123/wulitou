// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    isplay: any = 0;
    @property(cc.VideoPlayer)
    videoPlayer: cc.VideoPlayer = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        this.node.runAction(cc.sequence(
            cc.delayTime(1),
            cc.callFunc(function () {
                if (this.isplay == 0) {
                    this.isplay = 1;
                }
            }.bind(this))
        ));
    }

    CC_videoEvent(event) {
        // cc.log("视频事件 = " + this.isplay);
        switch (this.isplay) {
            case 0:
                this.videoPlayer.play();
                break;
            case 1:
                this.isplay = 2;
                this.videoPlayer.stop();
                let data = {};
                let eventCus = new cc.Event.EventCustom("videoStop", false);
                eventCus.setUserData(data);
                cc.systemEvent.dispatchEvent(eventCus);
                break;
            default:
                break;
        }
    }

    // update (dt) {}
}
