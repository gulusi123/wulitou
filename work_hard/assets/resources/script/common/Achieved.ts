import GameScene from "../GameScene";
import AchievedImg from "./AchievedImg";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Achieved extends cc.Component {

    /**
     * 关卡成就数量
     */
    public static LevelAchieved: number[] = [
        2, 1, 2, 12,
        2, 3, 4, 2,
        0, 5, 3, 0,
        3, 2, 0, 0,
        0, 0, 2, 1,
        5, 1
    ];
    /**
     * 已完成的成就图片
     */
    public static Img1: string[][] = [
        ["1-1","1-2"],["2-3"],["3-1","3-2"],["4-1","4-5","4-6",
        "4-21","4-22","4-24","4-25","4-31","4-32","4-33","4-34","4-35"],
        ["5-1","5-2"],["6-1","6-2","6-4"],["7-1","7-2","7-3","7-4"],["8-1","8-2"],
        [],["10-1","10-2","10-3","10-32","10-51"],["11-4","11-31","11-32"],[],
        ["13-2","13-3","13-5"],["14-1","14-2"],[],[],
        [],[],["19-2","19-3"],["20-2"],
        ["21-1","21-2","21-3","21-4","21-5"],["22-3"]
    ];
    /**
     * 未完成的成就图片
     */
    public static Img0: string[][] = [
        ["1-1","1-2"],["2-3"],["3-1","3-2"],["4-1","4-5","4-6",
        "4-21","4-22","4-24","4-25","4-31","4-32","4-33","4-34","4-35"],
        ["5-1","5-2"],["6-1","6-2","6-4"],["7-1","7-2","7-3","7-4"],["8-1","8-2"],
        [],["10-1","10-2","10-3","10-32","10-51"],["11-4","11-31","11-32"],[],
        ["13-2","13-3","13-5"],["14-1","14-2"],[],[],
        [],[],["19-2","19-3"],["20-2"],
        ["21-1","21-2","21-3","21-4","21-5"],["22-3"]
    ];

    public static achievedType : boolean[][] = [
        [true,false],[false],[true,false],[true,false,false,
            false,false,false,false,false,false,false,false,false],
        [false,false],[true,false,false],[true,false,false,false],[true,false],
        [],[true,false,false,false,false],[false,false,false],[],
        [false,false,false],[true,false],[],[],
        [],[],[false,false],[false],
        [true,false,false,false,false],[false]
    ]


    /**
     * 成就名称
     */
    public static ImgName: string[][] = [
        //1                     2           3                     4
        ["刷我滴卡","愣着干啥"],["触电的感觉"],["官宣:我们","注孤身"],["I'm Superman!","阿斌的新衣","看！果男","山寨的代价"
        ,"山寨的代价","山寨的代价","山寨的代价","低配版阿拉丁","低配版阿拉丁","低配版阿拉丁","低配版阿拉丁","低配版阿拉丁"],
        //5                     6                                 7                                        8
        ["下水道美人斌","请安全出行"],["多谢嫂嫂","伞，散","湿身play"],["顶顶在手，全勤我有","你总是手太凉","你是否有很多问号","上关风"],["哥哥敲腻害♂","我会回来的"],
        //9  10                                        11                              12          
        [],["特布，非一般的感觉","好多盐汽水","讹讹讹，屈想向天歌","讹讹讹，屈想向天歌","人性扭曲？道德沦丧？"],["老娘也敢摸？","怪大叔","老娘的战衣呢"],[],
        //13                             14                     15  16
        ["老子也敢惹！","基情百分百","成双成对？"],["你闻到酸味了吗？","好人卡:小美打卡成功"],[],[],
        //17 18 19                    20
        [],[],["别走,救我!","生命不可承受之重"],["恋人未满"],
        //23                                                   24
        ["凌波微步，不用走路","我可是丐帮八袋长老！","大战三百回合","我不是坏蜀黍","小弱鸡"],["阿斌：响屁不臭"]
    ];
    /**
     * 编号对应的关卡号
     */
    public static LevelNum: number[] = [
        1,1,
        2,
        3,3,
        4,4,4,4,4,4,4,4,4,4,4,4,
        5,5,
        6,6,6,
        7,7,7,7,
        8,8,
        10,10,10,10,10,
        11,11,11,
        13,13,13,
        14,14,
        19,19,
        20,
        21,21,21,21,21,
        22
    ];
    /**
     * 编号对应的成就序号
     */
    public static AchievedId: number[] = [
        1,2,    //1
        1,      //2
        1,2,  //3
        1,2,3,4,5,6,7,8,9,10,11,12,  //4
        1,2,   //5
        1,2,3, // 6
        1,2,3,4,  // 7
        1,2,  //8 
        1,2,3,4,5, //10
        1,2,3, //11
        1,2,3, //13
        1,2, //14
        1,2, // 19
        1,   //20
        1,2,3,4,5, //21
        1  //22
    ];
    /**
     * 成就序号
     */
    public static AchievedNum: number[][] = [
        //1    2   3       4
        [0,1],[2],[3,4],[5,6,7,8,9,10,11,12,13,14,15,16],
        //5      6          7             8
        [17,18],[19,20,21],[22,23,24,25],[26,27],
        //9  10            11       12
        [],[28,29,30,31,32],[33,34,35],[],
        //13        14     15  16
        [36,37,38],[39,40],[],[],
        //17 18 19      20 
        [],[],[41,42],[43],
        //21              22
        [44,45,46,47,48],[49]
    ];
    @property(cc.Node)
    pager: cc.Node = null;
    @property(cc.SpriteAtlas)
    resAtlas: cc.SpriteAtlas = null;
    @property(cc.Node)
    viewNode: cc.Node = null;
    @property(cc.Node)
    page: cc.Node = null;
    @property(cc.Prefab)
    achievedImgProfab = null;

    public static Instance: Achieved = null;

    public clickIndex = -1;
    onLoad () {
		Achieved.Instance = this;
	}

    start () {
        this.initAchievedPage();
    }
    /**
     * 加载成就图片
     */
    initAchievedPage(){
        //成就总数
        let totalCount = Achieved.getAchievedCount();
        //成就总页数
        let totalPage = Math.floor(totalCount/9);
        if(totalCount % 9 != 0){
            totalPage += 1;
        }
        let startX = 0;
        if(totalPage % 2 == 0){
            startX = -40 * totalPage/2 + 20;
        }else{
            startX = -40 * Math.floor(totalPage/2);
        }
        //初始化成就页面滚动条
        for(let i = 0 ; i < totalPage ; i++){
            let node = new cc.Node("p" + i);
            node.width = 40;
            node.height = 40;
            node.x = startX + i * 40;
            let sprite = node.addComponent(cc.Sprite);
            if(i == 0){
                sprite.spriteFrame = this.resAtlas.getSpriteFrame("yuan1");
            }else{
                sprite.spriteFrame = this.resAtlas.getSpriteFrame("yuan2");
            }
            this.pager.addChild(node);
        }
        //添加成就页面
        this.viewNode.width = cc.winSize.width;
        let pageView = this.viewNode.getComponent(cc.PageView);

        for(let i = 0; i < totalPage; i++){
            let p = cc.instantiate(this.page);
            p.name = "page_" + (i+1);
            p.x = i * cc.winSize.width;
            p.y = 0;
            pageView.addPage(p);
        }
        let pages: cc.Node[] = pageView.getPages();
        let distance = cc.winSize.width/3;
        for(let i=0; i<totalCount; i++){
            let pageIndex = Math.floor(i/9);
            let img = cc.instantiate(this.achievedImgProfab);
            let flag = i % 3;
            let index = Math.floor(i/3) % 3;
            if(flag == 0){
                img.x = -distance;
            }else if(flag == 1){
                img.x = 0;
            }else if(flag == 2){
                img.x = distance;
            }
            img.y = -20;
            let di = cc.find("bg", pages[pageIndex]).children[index];

            //随机一个-8到8的角度
            let angle = (Math.random() - 0.5) * 16;
            let script: AchievedImg = img.getComponent(AchievedImg);
            script.index = i;
            let type : boolean = Achieved.achievedType[Achieved.LevelNum[i]-1][Achieved.AchievedId[i]-1];
            script.initAchievedImg(Achieved.LevelNum[i], Achieved.AchievedId[i], angle,type);
            di.addChild(img);
        }
    }
    onPageEvent(pageView: cc.PageView, type: any, data: string){
        let currentPageIndex = pageView.getCurrentPageIndex();
        if(currentPageIndex < this.pager.childrenCount){
            for(let i=0; i<this.pager.childrenCount; i++){
                if(i == currentPageIndex){
                    this.pager.children[i].getComponent(cc.Sprite).spriteFrame = this.resAtlas.getSpriteFrame("yuan1");
                }else{
                    this.pager.children[i].getComponent(cc.Sprite).spriteFrame = this.resAtlas.getSpriteFrame("yuan2");
                }
            }
        }
    }
    backBtnClick(){
        //取消当前选择
        this.unselectAchievedImg();
        this.clickIndex = -1;
        GameScene.Instance.playBtnClick();
    }
    /**
     * 解锁成就界面的图片
     * @param levelNum 
     * @param id 
     */
    unlockAchieved(levelNum: number, id: number , success : boolean){
        try{
            let count = Achieved.AchievedNum[levelNum-1][id-1];
            let pageView = this.viewNode.getComponent(cc.PageView);
            let pages: cc.Node[] = pageView.getPages();
            let pageIndex = Math.floor(count/9);
            let flag = count % 3;
            let index = Math.floor(count/3) % 3;
            let di = cc.find("bg", pages[pageIndex]).children[index];
            let script: AchievedImg = di.children[flag + 1].getComponent(AchievedImg);
            script.initAchievedImg(levelNum, id, 0 , success);
        }catch(e){
            cc.log(e);
        }
    }
    /**
     * 取消上一个选择的图
     */
    unselectAchievedImg(){
        if(this.clickIndex != -1){
            try{
                let count = this.clickIndex;
                let pageView = this.viewNode.getComponent(cc.PageView);
                let pages: cc.Node[] = pageView.getPages();
                let pageIndex = Math.floor(count/9);
                let flag = count % 3;
                let index = Math.floor(count/3) % 3;
                let di = cc.find("bg", pages[pageIndex]).children[index];
                let script: AchievedImg = di.children[flag + 1].getComponent(AchievedImg);
                script.unselectImg();
            }catch(e){
                cc.log(e);
            }
        }
    }
    public static getAchievedCount(){
        let count = 0;
        for(let i=0; i<Achieved.LevelAchieved.length; i++){
            count += Achieved.LevelAchieved[i];
        }
        return count;
    }
}
