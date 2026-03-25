import { _decorator, Component, Node } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('Toast')
export class Toast extends Component {
    
    private static _instance: Toast | null = null;
    
    onLoad() {
        if (Toast._instance === null) {
            Toast._instance = this;
        } else {
            this.destroy();
            return;
        }
    }
    
    public static show(message: string, duration: number = 2000): void {
        if (Toast._instance) {
            Toast._instance.showToast(message, duration);
        }
    }
    
    private showToast(message: string, duration: number): void {
        // TODO: 实现Toast显示逻辑
        console.log(`Toast: ${message}`);
    }
}
