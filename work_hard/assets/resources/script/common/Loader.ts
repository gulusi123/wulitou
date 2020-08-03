const {ccclass, property} = cc._decorator;
import LoadMask from "../common/LoadMask";
@ccclass
export default class Loader extends cc.Component {

    public static Instance: Loader = null;
    @property(cc.Prefab)
    loadMaskPrefab: cc.Prefab = null;
    private loadMask: LoadMask = null;
    onLoad () {
        Loader.Instance = this;
        let mask = cc.instantiate(this.loadMaskPrefab);
        this.loadMask = mask.getComponent(LoadMask);
	}

    start () {

    }
    /**
     * 加载资源
     * @param url       资源地址 
     * @param callback  加载完成回调
     * @param node      当前节点  
     */
    loadRes(url: string, callback: (err: Error, res: any)=> any, node: cc.Node){
        this.loadMask.showMask(node);
        let self = this;
        cc.loader.loadRes(url, (error, resource: any)=>{
            self.loadMask.hidenMask();
            callback(error, resource);
        });
    }
}
