import BaseLevel from "../common/BaseLevel";
import Bajiaoshan from "../levels/Bajiaoshan"
const {ccclass, property} = cc._decorator;

@ccclass
export default class Bajiaoshan_yuDi extends cc.Component {
    
    @property(cc.Integer)
    downSpeed : number = 3;


    onLoad () {
	}

    onCollisionEnter(other, self) {
        Bajiaoshan.Instance.onYuDianKilled(this.node);
    }

    start () {

    }
    
    update(dt){
        this.node.y = this.node.y - this.downSpeed;
        if(this.node.y <= -360){
          Bajiaoshan.Instance.onYuDianKilled(this.node);
        }else if(this.node.y >= -120){
            this.node.x = this.node.x - (-0.5 + Math.random()*1);
        }
    }
}
