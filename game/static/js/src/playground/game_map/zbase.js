//GameMap是AcGameObject的派生类
class GameMap extends AcGameObject {
    constructor(playground) {
        //调用基类的构造函数，相当于将自己注册进AC_GAME_OBJECTS这个数组
        super();
        this.playground = playground;
        //点一定要标对`
        this.$canvas = $(`<canvas></canvas>`);
        //接下来操作的是context，这是2D的画布
        this.ctx = this.$canvas[0].getContext('2d');
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.playground.$playground.append(this.$canvas);
        

        
    }

    start() {

    }

    update() {
        //每一帧都画一遍，所以不在start执行，在update
        this.render();
    }

    render() {
        //背景颜色,半透明还能使小球移动有拖尾的效果
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
        //左上坐标和右下坐标
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}
