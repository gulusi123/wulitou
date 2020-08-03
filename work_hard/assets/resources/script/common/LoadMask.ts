const {ccclass, property} = cc._decorator;

@ccclass
export default class LoadMask extends cc.Component {

    private process = 0;

    onLoad () {
		
	}

    start () {

    }

    setProcess(process: number){
        this.process = process;
    }

    /**
     * 显示遮罩
     * @param parent   遮罩的父节点 
     */
    showMask(parent: cc.Node) {
        parent.addChild(this.node);
        this.node.width = parent.width;
        this.node.height = parent.height;
    }
    /**
     * 隐藏遮罩
     */
    hidenMask(){
        this.node.parent.removeChild(this.node);
    }
}
