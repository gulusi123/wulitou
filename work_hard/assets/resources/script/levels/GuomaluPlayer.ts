import Guomalu from "./Guomalu";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GuomaluPlayer extends cc.Component {

    onLoad () {
		var manager = cc.director.getCollisionManager();
        if(!manager.enabled){
            manager.enabled = true;
        }
	}

    start () {

    }
    
    onCollisionEnter(other: cc.Collider, self: cc.Collider){
        self.node.removeComponent(cc.Collider);
        Guomalu.Instance.playerRun = false;
        Guomalu.Instance.runAction = false;
        Guomalu.Instance.carHit();
    }
}
