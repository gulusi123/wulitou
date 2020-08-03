import GameScene from "../GameScene";
import DragBox from "./DragBox";
import AudioService from "./AudioService";

const {ccclass, property} = cc._decorator;
//道具栏
@ccclass
export default class PropBar extends cc.Component {

    public static Instance: PropBar = null;

    @property(cc.Node)
    props: cc.Node = null;
    onLoad () {
        PropBar.Instance = this;
	}

    start () {

    }
	
    // update (dt: number) {},
    
    /**
     * 道具栏添加道具
     * @param prop 
     * @param callback  添加完成回调
     */
    // addProp(prop: cc.Node, callback: ()=>any) {

    //     let worldV = prop.parent.convertToWorldSpaceAR(prop.getPosition());//道具原来的世界坐标
        
    //     //计算缩放倍数
    //     //let scale = this.props.height/Math.max(prop.width, prop.height);
    //     let x = this.props.height/2 + this.props.height * this.props.childrenCount - this.props.width/2;
    //     let newWorldV = this.props.convertToWorldSpaceAR(cc.v2(x, 0));//道具新的世界坐标
    //     //计算新的世界坐标和原来世界坐标差
    //     let distanceX = newWorldV.x - worldV.x;
    //     let distanceY = newWorldV.y - worldV.y;

    //     //执行动作道具拾取动作
    //     let a1 = cc.moveTo(0.25, cc.v2(prop.x + distanceX, prop.y + distanceY));
    //     //let a2 = cc.scaleTo(0.25, scale);
    //     // let action = cc.spawn(a1, a2);
    //     let self = this;
    //     let finish = cc.callFunc(function(){
    //         prop.x = x;
    //         prop.y = 0;
    //         prop.parent = self.props;
    //         //移除按钮事件
    //         prop.removeComponent(cc.Button);
    //         callback();
    //     });
    //     prop.runAction(cc.sequence(a1, finish));
    //     //显示获取道具弹窗
    //     // let drag: DragBox = prop.getComponent(DragBox);
    //     // GameScene.Instance.showReceiveProp(drag);
    // }
    /**
     * 添加道具至道具栏
     * @param prop  道具节点
     * @param callback  回调
     */
    addProp(prop: cc.Node, callback: ()=>any) {
        AudioService.Instance.playEffect("getprop",false);
        //移除按钮事件
        prop.removeComponent(cc.Button);
        let x = this.props.height/2 + this.props.height * this.props.childrenCount - this.props.width/2;
        let worldV = prop.parent.convertToWorldSpaceAR(prop.getPosition());//道具原来的世界坐标
        let newPos = this.props.convertToNodeSpaceAR(worldV);
        prop.parent = this.props;
        prop.setPosition(newPos);

        //执行动作道具拾取动作
        cc.tween(prop).to(0.5, {position: cc.v2(x, 0)}).call(callback).start();
        //显示获取道具弹窗
        let drag: DragBox = prop.getComponent(DragBox);
        GameScene.Instance.showReceiveProp(drag);
    }
    /**
     * 道具栏移除道具
     * @param prop 
     * @param destory   是否销毁道具 
     */
    removeProp(prop: cc.Node, destory?: boolean){
        this.props.removeChild(prop);
        if(destory){
            prop.stopAllActions();
            prop.destroy();
        }
        let nodes = this.props.children;
        for(let i=0; i<nodes.length; i++){
            nodes[i].x = this.props.height/2 + this.props.height * i - this.props.width/2;
            let drag: DragBox = nodes[i].getComponent(DragBox);
            drag.setInitPos(drag.node.getPosition());
        }
    }
    propExist(prop: cc.Node): boolean {
        for(let node of this.props.children){
            if(node.uuid == prop.uuid){
                return true;
            }
        }
        return false;
    }
}
