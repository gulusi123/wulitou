const {ccclass, property} = cc._decorator;

export default class LevelInfo  {

    /**
     * 已有提示状态
     */
    public static TIP_STAT_ON = 1;
    /**
     * 待查看视频获得状态
     */
    public static TIP_STAT_OFF = 2;
    /**
     * 锁定状态
     */
    public static TIP_STAT_LOCK = 3;

    /**
     * 关卡锁定
     */
    public static LEVEL_LOCK = 0;
    /**
     * 关卡解锁
     */
    public static LEVEL_UNLOCK = 1;

    /**
     * 成就未解锁
     */
    public static ACHIEVED_LOCK = 0;

    /**
     * 成就已解锁
     */
    public static ACHIEVED_UNLOCK = 1;
    
    /**
     * 关卡号
     */
    public level: number = 0;
    /**
     * 关卡解锁状态
     */
    public state: number = LevelInfo.LEVEL_LOCK;
    /**
     * 关卡提示状态
     */
    public tipState: number[] = [LevelInfo.TIP_STAT_OFF, LevelInfo.TIP_STAT_LOCK, LevelInfo.TIP_STAT_LOCK];
    /**
     * 关卡成就状态
     */
    public achieved: number[] = [];

    constructor(level: number, achievedNum: number){
        this.level = level;
        for(let i=0; i<achievedNum; i++){
            this.achieved.push(LevelInfo.ACHIEVED_LOCK);
        }
    }
}
