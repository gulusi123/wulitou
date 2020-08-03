import Shoujichongdian from "../levels/Shoujichongdian"

const {ccclass, property} = cc._decorator;

@ccclass
export default class Shoujichongdian_abin extends cc.Component {


    isStopMove(){
        if(!Shoujichongdian.instanse.patientMove){
            Shoujichongdian.instanse.isStopMove();
        }
    }


}
