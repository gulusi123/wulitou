import DragBox from "./DragBox";
import BaseLevel from "./BaseLevel";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ReceiveProp extends cc.Component {

    @property(cc.Sprite)
    prop: cc.Sprite = null;
    @property(cc.Label)
    nameLabel: cc.Label = null;

    private level: BaseLevel = null;
    onLoad () {
		
	}

    start () {

    }
    
    okBtnClick(){
        this.closeWindow();
    }
   
    closeWindow(destory?: boolean){
        let w = this.node.getChildByName("window");
        let a = cc.scaleTo(0.2, 0.2, 0.2);
        let self = this;
        let finished = cc.callFunc(function(){
            self.node.active = false;
            if(destory){
                self.node.destroy();
            }
            if(self.level != null && self.level["onReceivePropOk"]){
                self.level["onReceivePropOk"]();
            }
        })
        w.runAction(cc.sequence(a, finished));
    }

    showWindow(drag: DragBox, level: BaseLevel){
        this.level = level;
        this.nameLabel.string = drag.propName;
        this.prop.spriteFrame = drag.getDragImage();
        let w = this.node.getChildByName("window");
        w.setScale(0.2);
        this.node.active = true;
        let a = cc.scaleTo(0.2, 1, 1);
        w.runAction(a);
    }
}
