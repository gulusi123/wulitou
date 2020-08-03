const {ccclass, property} = cc._decorator;

@ccclass
export default class Banner extends cc.Component {

    onLoad () {
		this.scheduleOnce(this.showBannerAd.bind(this), 5);
	}

    start () {
        
    }
    
    showBannerAd(){
        if(cc.sys.platform == cc.sys.ANDROID){
            if(window["banner"] == null){
                let self = this;
                window["banner"] = {
                    preloadError: self.preloadError.bind(self),
                    preloadSuccess: self.preloadSuccess.bind(self),
                    onShow: self.onShow.bind(self)
                };
            }
            //显示Banner广告
            jsb.reflection.callStaticMethod("org/cocos2dx/javascript/SdkApi", "showNativeBannerAd", "(II)V", cc.winSize.width, 150);
        }else{
            cc.log("非android环境，不显示广告");
        }
    }

    onShow(){

    }
    preloadError(code: number, msg: string){
        cc.log("预加载错误" + code + "-->" + msg);
    }
    
    preloadSuccess(id: string){
        
    }

}
