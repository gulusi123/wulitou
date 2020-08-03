const {ccclass, property} = cc._decorator;

@ccclass
export default class GameMgr extends cc.Component {

    public static Instance: GameMgr = null;
    private backEvent: ()=>any = null;
    onLoad () {
        GameMgr.Instance = this;
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.keyDown, this);
	}

    start () {

    }
	onDestroy() {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.keyDown, this);
    }

	private keyDown(event: cc.Event.EventKeyboard) {
        if(event.keyCode == cc.macro.KEY.back){
            this.backClick();
        }
    }

    backClick(){
        if(this.backEvent != null){
            this.backEvent();
        }else{
            cc.game.end();
        }
    }
    
    bindBackEvent(backEvent: ()=>any){
        this.backEvent = backEvent;
    }
}
