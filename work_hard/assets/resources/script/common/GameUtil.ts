const {ccclass, property} = cc._decorator;
import LevelInfo from "./LevelInfo";
import Achieved from "./Achieved";
@ccclass
export default class GameUtil extends cc.Component {

    public static Instance: GameUtil = null;
    
    onLoad () {
		GameUtil.Instance = this;
	}

    start () {

    }
    /**
     * 修改当前节点的父节点，节点显示位置不变
     * @param current 当前节点 
     * @param newParent 新的父节点
     */
    transportParent(current : cc.Node , newParent : cc.Node){
        let current_pos_world = current.convertToWorldSpaceAR(cc.v2(0,0));
        let current_queue_pos = newParent.convertToNodeSpaceAR(current_pos_world);
        current.parent = newParent;
        current.setPosition(current_queue_pos);
    }
}
