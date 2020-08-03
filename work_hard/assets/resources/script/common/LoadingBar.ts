const {ccclass, property} = cc._decorator;

@ccclass
export default class LoadingBar extends cc.Component {

    @property(cc.Node)
    processBar: cc.Node = null;
    @property(cc.Label)
    processLabel: cc.Label = null;
    private maxWidth = 0;
    private process: number = 0;
    onLoad () {
        this.maxWidth = this.node.width - 20;
        this.setProcess(0);
	}

    start () {

    }

    update (dt: number){
        if(this.process < 1){
            this.process += 0.01;
            this.setProcess(this.process);
        }
    }
    setProcess(process: number){
        let showProcess = (process * 100).toFixed(0);
        this.processLabel.string = showProcess + "%";
        this.processBar.width = Math.floor(this.maxWidth * process);
    }
}
