import Achieved from "./Achieved";
import GameInfo from "./GameInfo";

const {ccclass, property} = cc._decorator;

@ccclass
export default class AchievedImg extends cc.Component {

    @property(cc.Label)
    nameLabel: cc.Label = null;
    @property(cc.Sprite)
    img: cc.Sprite = null;
    @property(cc.Sprite)
    bgImg: cc.Sprite = null;
    @property(cc.Node)
    selectNode: cc.Node = null;
    @property(cc.SpriteAtlas)
    resAtlas: cc.SpriteAtlas = null;
    @property(cc.SpriteAtlas)
    imgAtlas0: cc.SpriteAtlas = null;//未完成成就的图集
    @property(cc.SpriteAtlas)
    imgAtlas1: cc.SpriteAtlas = null;//已完成成就的图集


    public index = 0;

    private isLock = true;
    private isEnable = false;
    onLoad () {
		
	}

    start () {

    }
    
    initAchievedImg(levelNum: number, id: number, bgAngle: number, success ?: boolean){
        //判断当前成就是否解锁
        let isLock = GameInfo.Instance.achievedIsLock(levelNum, id);
        this.isLock = isLock;
        if(isLock){
            this.bgImg.spriteFrame = this.resAtlas.getSpriteFrame("wfxdi");
            this.nameLabel.string = "? ? ? ? ?";

            //设置成就图
            this.img.spriteFrame = this.imgAtlas1.getSpriteFrame(Achieved.Img0[levelNum-1][id-1]);
        }else{
            //cc.log("initAchievedImg : " + success);
            if(success == true){
                this.bgImg.spriteFrame = this.resAtlas.getSpriteFrame("cgdi");
            }else{
                this.bgImg.spriteFrame = this.resAtlas.getSpriteFrame("sbdi");
            }
            if(levelNum - 1 < Achieved.Img0.length && id - 1 < Achieved.Img0[levelNum-1].length){
                this.nameLabel.string = Achieved.ImgName[levelNum-1][id-1];
            }
            //设置成就图
            //cc.log(Achieved.Img1[levelNum-1][id-1]);
            this.img.spriteFrame = this.imgAtlas0.getSpriteFrame(Achieved.Img1[levelNum-1][id-1]);
        }

        if(bgAngle != 0){
            this.bgImg.node.angle = bgAngle;
        }
    }

    /**
     * 显示选择框
     */
    selectImg(){
        if(!this.isEnable){
            return;
        }
        if(this.isLock){
            return;
        }
        if(Achieved.Instance != null){
            //先取消上一个选择
            Achieved.Instance.unselectAchievedImg();
            Achieved.Instance.clickIndex = this.index;
        }
        this.selectNode.active = true;
    }
    /**
     * 取消选择框
     */
    unselectImg(){
        this.selectNode.active = false;
    }

    bgClick(){
        this.selectImg();
    }
}
