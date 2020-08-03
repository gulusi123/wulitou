const {ccclass, property} = cc._decorator;

@ccclass
export default class DragBox extends cc.PolygonCollider {

    @property(cc.Boolean)
    dragabled = false;
    @property(cc.String)
    propName: string = ""
    private isRunAction = false;
    private receiver: any = null;
    /**
     * 初始位置
     */
    private initPos: cc.Vec2 = null;
    /**
     * 拖拽接收回调
     */
    private receiveCallback: (drag: DragBox, receiver: cc.Collider)=>any = null; 
    onLoad () {
        var manager = cc.director.getCollisionManager();
        if(!manager.enabled){
            manager.enabled = true;
        }
        this.initDragListener(true);
	}

    start () {

    }
    onDestroy() {
        this.initDragListener(false);
    }
    /**
     * 设置拖拽接收回调
     * @param receiveCallback 
     */
    setReceiveCallback(receiveCallback: (drag: DragBox, receiver: cc.Collider)=>any){
        this.receiveCallback = receiveCallback;
    }
    /**
     * 设置初始位置
     * @param pos 
     */
    setInitPos(pos: cc.Vec2){
        this.initPos = pos;
    }
	initDragListener(register: boolean){
        if(register){
            this.node.on(cc.Node.EventType.TOUCH_MOVE, this.touchEvent, this);
            this.node.on(cc.Node.EventType.TOUCH_END, this.touchEvent, this);
        }else{
            this.node.off(cc.Node.EventType.TOUCH_MOVE, this.touchEvent, this);
            this.node.off(cc.Node.EventType.TOUCH_END, this.touchEvent, this);
        }
    }
    touchEvent (event: cc.Event.EventTouch){
        if(!this.dragabled || this.isRunAction){
            return;
        }
        if(event.getType() == cc.Node.EventType.TOUCH_MOVE){
            this.node.x += event.getDeltaX();
            this.node.y += event.getDeltaY();
            //如果超出屏幕了自动回去
            let pos = this.node.parent.convertToWorldSpaceAR(this.node.getPosition());
            if(pos.x > cc.winSize.width || pos.y > cc.winSize.height || pos.x < 0 || pos.y < 0){
                this.returnInitPos();
            }
        }else if(event.getType() == cc.Node.EventType.TOUCH_END){
            if(this.receiver != null){
                if(this.receiveCallback != null){
                    // this.node.setParent(this.receiver.node);
                    // this.node.setPosition(0, 0);
                    //this.node.parent = this.receiver.node;
                    this.receiveCallback(this, this.receiver);
                }
            }else{
                //回到原来的位置
                this.returnInitPos();
            }
        }
    }

    /**
     * 回到原位
     */
    returnInitPos(){
        this.isRunAction = true;
        let self = this;
        cc.tween(this.node).to(0.5, {position: this.initPos}).call(()=>{
            self.isRunAction = false;
        }).start();
    }

    /**
     * 获取道具图片
     */
    getDragImage() {
        let sprite = this.node.getComponent(cc.Sprite);
        if(sprite != null){
            return sprite.spriteFrame;
        }else{
            for(let node of this.node.children){
                sprite = node.getComponent(cc.Sprite);
                if(sprite != null){
                    return sprite.spriteFrame;
                }
            }
        }
    }
    onCollisionEnter(other: any, self: any){
        this.receiver = other;
    }
    onCollisionExit(other: any, self: any) {
        this.receiver = null;
    }
}
