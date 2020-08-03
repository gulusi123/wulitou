const {ccclass, property} = cc._decorator;
import LevelInfo from "./LevelInfo";
import Achieved from "./Achieved";
import GameScene from "../GameScene";
@ccclass
export default class GameInfo extends cc.Component {
    
    public static Instance: GameInfo = null;
    private levelInfos: LevelInfo[] = [];
    public static Total_Level = 24;
    private static GAME_INFO = "GAME_INFO";
    public static GAME_SHADOW = "GAME_SHADOW";
    public static GAME_GIFT = "GAME_GIFT"; 

    //22关重来
    public static _22isRetry : boolean = false;
    //是否获取到影藏道具(22关影藏道具)
    public static isGetShadowProp : boolean = false;
    //是否获取到礼物给小美(通关23关获得)
    public static getGiftForXM : boolean = false;
    
    public static LevelPrefab = ["",
    //1,2,3,4
    "gongpai","kaihuadakaji","bangxiaomei","superman",
    //5,6,7,8
    "guomalu","bajiaoshan","dingding","dalidrink",
    //9,10,11,12
    "wucidaka","tebu","nanbannvzhuang","diantisuiji",
    //13,14,15,16
    "dalaodajia","mimadaka","dingdingdaka","jindianti",
    //17,18,19,20
    "chengyujielong","diantijianfa","shoujichongdian","zhaojingzi",
    //21,22，23,24
    "wugongmiji","shuangmiandianti","gongzifenpei","biaobai"];
    
    /**
     * 关卡背景音乐
     */
    public static LevelBg = ["",
    //1,2,3,4
    "bg2","bg2","bg2","bg2",
    //5,6,7,8
    "bg2","bg2","bg2","bg2",
    //9,10,11,12
    "bg2","bg2","bg2","bg2",
    //13,14,15,16
    "bg2","bg2","bg2","bg2",
    //17,18,19,20
    "bg2","bg2","bg2","bg2",
    //21,22,23,24
    "bg2","bg2","bg2","bg3"];
    
    /**
     * 关卡目的
     */
    public static LevelTarget = ["",
    //1,2,3,4
    "呀！来不及了，赶快打卡！",
    "小美都来了呀？风度风度，帅气打卡",
    "前面谁啊？挡在电梯门口，烦人",
    "尼玛，这是菜市场啊？一大坨人挡着怎么上楼啊？",
    //5,6,7,8
    "车水马龙，龙马精神，神清气爽，爽快过马路",
    "乌云乌云快走开，你可知道我不常带把伞",
    "要想生活过得好，全勤打卡不能少",
    "嘿，三个大汉儿堵电梯，我可怎么进去",
    //9,10,11,12
    "还有半分钟，搞快点儿打卡",
    "绿灯？我真是个lucky boy，快点过马路吧",
    "怎么这么多人排队？希望这一趟能挤得进去",
    "烦人的很，谁在乱按电梯嘛？",
    //13,14,15,16
    "又是一群人我怎么进电梯嘛？",
    "要迟到了！我的打卡密码是多少来着？",
    "这么多人肯定来不及了，得想个办法打卡",
    "今天人少，我一定挤得上去",
    //17,18,19,20
    "怎么又这么多人，我要迟到啦！啊！怎么办怎么办",
    "快快快快，要迟到了",
    "怎么电梯又被挡了？",
    "美女，你倒是让我一下啊，我要按电梯啊！",
    //21,22,23,24
    "大清早的，斧头帮排练个鬼哦，把大门都挡住了",
    "完犊子了，人这么多，肯定要迟到","",""];


    onLoad () {
		GameInfo.Instance = this;
        this.initLevelInfos();
	}

    start () {

    }
    private initLevelInfos(){
        this.clearSaveGameInfo();
        
        let infos: string = cc.sys.localStorage.getItem(GameInfo.GAME_INFO);
        if(infos != null && infos.indexOf("achieved") == -1){
            this.clearSaveGameInfo();
            infos = "";
        }
        if(infos != null && infos != ""){
            this.levelInfos = JSON.parse(infos);
        }
        if(this.levelInfos.length < GameInfo.Total_Level ){
            for(let i=this.levelInfos.length; i < GameInfo.Total_Level; i++){
                //初始化关卡信息
                let info = new LevelInfo(i + 1, Achieved.LevelAchieved[i]);
                if(i == 0){
                    info.state = LevelInfo.LEVEL_UNLOCK;//第一关默认为解锁状态
                }
                this.levelInfos.push(info);
            }
            this.saveGameInfo();
        }
    }
    /**
     * 获取关卡信息
     * @param level 
     */
    public getLevelInfo(level: number): LevelInfo {
        if(level > 0 && level <= this.levelInfos.length){
            return this.levelInfos[level-1];
        }
        return null;
    }

    public setLevelInfo(info: LevelInfo){
        this.levelInfos[info.level-1] = info;
        this.saveGameInfo();
    }

    public clearSaveGameInfo(){
        cc.sys.localStorage.removeItem(GameInfo.GAME_INFO);
        cc.sys.localStorage.removeItem(GameInfo.GAME_GIFT);
        cc.sys.localStorage.removeItem(GameInfo.GAME_SHADOW);

    }
    public saveGameInfo(){
        cc.sys.localStorage.setItem(GameInfo.GAME_INFO, JSON.stringify(this.levelInfos));
    }
    
    /** 
     * 获取已经完成的成就个数
    */
    public getAreadyAchievedNum() : number{
        let num = 0;
        for(let i = 0 ;i < this.levelInfos.length ; i ++){
            let levelInfo = this.levelInfos[i];
            let achieved = levelInfo.achieved;
            for(let j = 0 ; j < achieved.length;j ++){
               if(achieved[j] == 1){
                   num++;
               }
            }
        }
        return num;
    }

    /**
     * 解锁关卡
     * @param level 
     */
    public unlockLevel(level: number,flag ?: boolean){

        if(level < GameInfo.Total_Level + 1 && GameInfo.LevelPrefab[level] != ""){
            if(level == 23){//解锁隐藏关卡
                if(GameInfo.Instance.getAreadyAchievedNum() != Achieved.getAchievedCount()){
                    return;
                }else{
                    let tips = "23关已经解锁";
                    if(Boolean(cc.sys.localStorage.getItem(GameInfo.GAME_SHADOW)) == true && !this.isLock(23)){
                        this.levelInfos[23].state = LevelInfo.LEVEL_UNLOCK;
                        tips = "隐藏关卡已解锁";
                    }
                    GameScene.Instance.tipQueue.push(tips);
                }
            }else if (level == 24){//获得隐藏道具切解锁23关
                if(Boolean(cc.sys.localStorage.getItem(GameInfo.GAME_SHADOW)) == true && !this.isLock(23)){
                    GameScene.Instance.tipQueue.push("24关已经解锁");
                }else{
                    return;
                }
            }
            this.levelInfos[level-1].state = LevelInfo.LEVEL_UNLOCK;
            this.saveGameInfo();
            
        }
    }
    
    public isLock(level: number){
        if(level < GameInfo.Total_Level + 1){
            return this.levelInfos[level-1].state == LevelInfo.LEVEL_LOCK;
        }
        return true;
    }
    
    /**
     * 解锁成就
     * @param levelNum  关卡
     * @param id  成就编号
     */
    public unlockAchieved(levelNum: number, id: number,success : boolean){
        if(id < 1){
            return;
        }
        if(id - 1 < this.levelInfos[levelNum-1].achieved.length){
            this.levelInfos[levelNum-1].achieved[id-1] = LevelInfo.ACHIEVED_UNLOCK;
        }
        //=== 检测关卡23 是否满足解锁条件 ===
        if(GameInfo.Instance.getAreadyAchievedNum() == Achieved.getAchievedCount()){
            if(this.isLock(23)){
                GameInfo.Instance.unlockLevel(23);
                //GameScene.Instance.tipQueue.push("23关已经解锁");
            }
        }
        this.saveGameInfo();
        if(Achieved.Instance != null){
            Achieved.Instance.unlockAchieved(levelNum, id ,success);
        }
    }

    /**
     * 判断成就是否锁定
     * @param levelNum 
     * @param id 
     */
    public achievedIsLock(levelNum: number, id: number): boolean{
        if(id < 1){
            return true;
        }
        if(id - 1 < this.levelInfos[levelNum-1].achieved.length){
            if(this.levelInfos[levelNum-1].achieved[id-1] == LevelInfo.ACHIEVED_UNLOCK){
                return false;
            }
        }
        return true;
    }
    /**
     * 获取成就进度
     * @param levelNum 
     */
    public getAchievedProgress(levelNum: number): number{
        let achieved = this.levelInfos[levelNum-1].achieved;
        if(achieved.length == 0){
            return 1;
        }else{
            let count = 0;
            for(let i=0; i<achieved.length; i++){
                if(achieved[i] == LevelInfo.ACHIEVED_UNLOCK){
                    count++;
                }
            }
            return count/achieved.length;
        }
    }
}
