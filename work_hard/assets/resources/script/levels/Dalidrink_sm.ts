import BaseLevel from "../common/BaseLevel";
import Bajiaoshan from "../levels/Bajiaoshan"
import AudioService from "../common/AudioService";
const {ccclass, property} = cc._decorator;

@ccclass
export default class Dalidrink_sm extends cc.Component {
    

    theFirstStrongMan(){
        AudioService.Instance.playEffect("cast",false);
    }

    onLoad () {
	}

}
