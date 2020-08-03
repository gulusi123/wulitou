import BaseLevel from "../common/BaseLevel";



const {ccclass, property} = cc._decorator;

@ccclass
export default class Dingdingdaka extends BaseLevel {
    
    @property(cc.Sprite)
    abin : cc.Sprite = null;
    @property(cc.Node)
    phone : cc.Node = null;
    @property(cc.Sprite)
    wall : cc.Sprite = null;
    @property(cc.Sprite)
    road : cc.Sprite = null;
    @property(cc.SpriteFrame)
    wifi : Array<cc.SpriteFrame> = [];
    @property(cc.SpriteFrame)
    timeNum : Array<cc.SpriteFrame> = [];
    @property(cc.Integer)
    dakaCount : number = 3;
    @property(cc.SpriteFrame)
    dakaRight : cc.SpriteFrame = null;
    @property(cc.Node)
    time : cc.Node = null;
    private direction  = 0;
    private pageNumber= 0;
    private dakaNum = 0;
    private timeHour = [8,8,9,9];
    // private allTimeOfHour = [];
    // private beforeEightNum = 0;
    // private successCount = 0;
    // private timeIndex = 0;
    // private firstOpenTel = false;
    
    private static TEXT = {
        Win: "手速是怎样炼成的",
        OutTime:"脑子：手的锅...",
        NpSignal: "中华有为：5G了解一下"
    }

    onLoad () {
        //动态设置背景墙的高度
        let wall = cc.find("background/wall", this.node);
        wall.height = cc.winSize.height/2;
        let road = cc.find("background/road", this.node);
        road.height = cc.winSize.height + road.y;
         
        this.initPageInfo(1, 2);
        this.loadTarget(this.abin.node);
        this.initTime();

        this.schedule(function(){
            this.timeChange();
        }.bind(this),2);
    }
    
    initTime(){
        // //初始10个hour
        // for(let i = 0 ; i < 10 ; i ++){
        //     let hour = this.timeHour[Math.floor(Math.random())];
        //     this.allTimeOfHour.push(hour);
        //     if(hour == 8){
        //         //八点以前的时间总个数
        //         this.beforeEightNum ++;
        //     }
        // }
        
        let daka = this.phone.getChildByName("telPhone").getChildByName("daka");
        let dakaList = daka.children;
        for(let i = 0 ; i < dakaList.length ; i ++){
            let time = dakaList[i].getChildByName("time");
            dakaList[i].addComponent(cc.Button);
            this.setTime(time,this.timeHour[i]);
            this.setDakaHandler(dakaList[i]);
        }
    }

    abinMove_up(){
        if(this.direction == 0){
            this.wall.getComponent(cc.Button).interactable = false;
            let anim_abin = this.abin.getComponent(cc.Animation);
            anim_abin.play("abinMove");
            anim_abin.on("finished",function(){
                this.direction = 1;
                this.road.getComponent(cc.Button).interactable = true;
                this.wifiChange();
            }.bind(this));
        }
    }
    
    abinMove_down(){
        if(this.direction == 1){
            this.road.getComponent(cc.Button).interactable = false;
            let anim_abin = this.abin.getComponent(cc.Animation);
            var animState = anim_abin.play("abinMove");
            animState.wrapMode = cc.WrapMode.Reverse;
            anim_abin.on("finished",function(){
                this.direction = 0;
                animState.wrapMode = cc.WrapMode.Normal;
                this.wall.getComponent(cc.Button).interactable = true;
                this.wifiChange();
            }.bind(this));
        }
    }
    
    wifiChange(){
        this.road.getComponent(cc.Button).interactable = true;
        let sj_wifi = this.phone.getChildByName("telPhone").getChildByName("sj-wifi");
        switch(this.direction){
            case 0 :
                if(this.pageNumber == 0){
                    sj_wifi.getComponent(cc.Sprite).spriteFrame = this.wifi[0];
                }else{
                    sj_wifi.getComponent(cc.Sprite).spriteFrame = this.wifi[1];
                }
                break;
            case 1 :
                if(this.pageNumber == 0){
                    sj_wifi.getComponent(cc.Sprite).spriteFrame = this.wifi[2];
                }else{
                    sj_wifi.getComponent(cc.Sprite).spriteFrame = this.wifi[3];
                }
                break;
        }
    }

    phoneScale(e: cc.Event.EventTouch,str){
        switch(str){
            case  "open":
                this.changePlayerEvent();
                this.phone.active = true;
                this.abin.node.getChildByName("phone_button")
                .getComponent(cc.Button).interactable = false;
                this.timeChange();
                break;
            case  "close":
                this.dakaNum = 0;
                this.changePlayerEvent();
                this.phone.active = false;
                this.abin.node.getChildByName("phone_button")
                .getComponent(cc.Button).interactable = true;
                this.removeAllDaKaTips(); 
                break;
        }
    }
    
    /**
     * 开始刷新时间
     */
    startRefreshTime(){

    }

    randomSort(arr) {
        // 对数组进行随机打乱,
        // return大于0则交换位置,小于等于0就不交换
        // 由于Math.random()产生的数字为0-1之间的数
        // 所以0.5-Math.random()的是否大于0是随机结果
        // 进而实现数组的随机打乱
        var array = arr.slice();
        array.sort(function () {
          return 0.5 - Math.random();
        })
        // 在控制台输出结果
        //console.log(array);
        return array;
    }
   
    timeChange(){
        this.timeHour = this.randomSort(this.timeHour);
        let daka = this.phone.getChildByName("telPhone").getChildByName("daka");
        let dakaList = daka.children;
        for(let i = 0 ; i < dakaList.length ; i ++){
            let time = dakaList[i].getChildByName("time");
            this.setTime(time,this.timeHour[i]);
        }
    }

    setTime(time :cc.Node, hour : number) : number{
        //随机小时
        let minute = 0;
        let second = 0;
        if(hour == 9){
            //随机分钟不超过10
            minute = Math.floor(Math.random()*10);
        }else{
            minute = 59 - Math.floor(Math.random()*10);
        }
        second = Math.floor(Math.random()*59);
        time.getChildByName("hour").getComponent(cc.Sprite)
            .spriteFrame = this.timeNum[hour];
        time.getChildByName("minute_1").getComponent(cc.Sprite)
            .spriteFrame = this.timeNum[Math.floor(minute/10)];
        time.getChildByName("minute_2").getComponent(cc.Sprite)
            .spriteFrame = this.timeNum[minute%10];
        time.getChildByName("second_1").getComponent(cc.Sprite)
            .spriteFrame = this.timeNum[Math.floor(second/10)];
        time.getChildByName("second_2").getComponent(cc.Sprite)
            .spriteFrame = this.timeNum[second%10];
        return hour;
    }

    setDakaHandler(target : cc.Node){
        let clickHandler = new cc.Component.EventHandler();
        clickHandler.target = this.node;
        clickHandler.component = "Dingdingdaka";
        clickHandler.handler = "dakaClick";
        //clickHandler.customEventData = data;
        let button = target.getComponent(cc.Button);
        button.clickEvents.push(clickHandler);
    }
    
    dakaClick(e : cc.Event.EventTouch){
        let anjian = e.target;
        let sprite_hour = anjian.getChildByName("time")
                                .getChildByName("hour");
        let hourSpriteName = sprite_hour.getComponent(cc.Sprite).spriteFrame.name;
        if(this.direction != 1 || this.pageNumber != 1){
            this.showLevelResult(false,2,Dingdingdaka.TEXT.NpSignal);
        }else{
            if(hourSpriteName == this.timeNum[9].name){
                this.showLevelResult(false,1,Dingdingdaka.TEXT.OutTime);
            }else{
                this.dakaNum ++;
                this.addDakaOkTips(anjian);
                this.scheduleOnce(function(){
                    if(this.dakaNum == this.dakaCount){
                        this.unscheduleAllCallbacks();
                        this.showLevelResult(true,0,Dingdingdaka.TEXT.Win)
                    }else{
                        this.removeAllDaKaTips();
                        this.timeChange();
                    }
                }.bind(this),0.1);
            }
        }
    }
    
    removeAllDaKaTips(){
        let daka = this.phone.getChildByName("telPhone").getChildByName("daka");
        let dakaList = daka.children;
        for(let i = 0 ; i < dakaList.length ; i ++){
            //dakaList[i].removeComponent(cc.Button)
            let child = dakaList[i].children;
            for(let j = 0 ; j < child.length ; j ++){
                if(child[j].name == "daka_ok"){
                     dakaList[i].removeChild(child[j]);
                }
            }
        }
    }

    addDakaOkTips(parent){
        let right = new cc.Node();
        right.name = "daka_ok";
        right.addComponent(cc.Sprite);
        right.getComponent(cc.Sprite).spriteFrame = this.dakaRight;
        right.parent = parent;
        right.setPosition(cc.v2(0,0));
    }


    update (dt) {
       
    }

    sceneChange(type :number ,index :number){
        this.pageNumber = index;
        this.wifiChange();
    }
}
