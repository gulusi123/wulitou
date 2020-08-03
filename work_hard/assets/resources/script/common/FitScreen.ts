const {ccclass, property} = cc._decorator;
/**
 * 屏幕自适应脚本，挂载到每个场景的Canvas节点上
 */
@ccclass
export default class FitScreen extends cc.Component {

    onLoad () {
        cc.view.setResizeCallback(()=> this.fitScreen());
        this.fitScreen();
	}

    start () {

    }
    
    private fitScreen() {
        //屏幕比例
        let screenRatio = cc.winSize.width/cc.winSize.height;
        //设计比例
        let designRatio = cc.Canvas.instance.designResolution.width/cc.Canvas.instance.designResolution.height;
        if(screenRatio <= 1){
            if(screenRatio <= designRatio){
                this.fitWidth();
            }else{
                this.fitHeight();
            }
        }else{
            this.fitHeight();
        }
    }

    private fitHeight(){
        cc.Canvas.instance.fitHeight = true;
        cc.Canvas.instance.fitWidth = false;
    }
    private fitWidth(){
        cc.Canvas.instance.fitHeight = false;
        cc.Canvas.instance.fitWidth = true;
    }
}
