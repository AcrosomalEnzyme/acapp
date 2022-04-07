//GameMap是AcGameObject的派生类
class GameMap extends AcGameObject {
    constructor(playground) {
        //调用基类的构造函数，相当于将自己注册进AC_GAME_OBJECTS这个数组
        super();
        this.playground = playground;
        //点一定要标对`
        this.$canvas = $(`<canvas tabindex=0></canvas>`);
        //接下来操作的是context，这是2D的画布
        this.ctx = this.$canvas[0].getContext('2d');
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.playground.$playground.append(this.$canvas);
        
        //this.background_img = new Image();
        //this.background_img.src = "https://app1881.acapp.acwing.com.cn/static/image/menu/background.JPG";
    }

    start() {
        this.$canvas.focus();

    }

    //地图随窗口大小变化
    resize()
    {
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;
        this.ctx.fillStyle = "rgba(0, 0, 0, 1)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    update() {
        //每一帧都画一遍，所以不在start执行，在update
        this.render();
    }

    render() {
        //背景颜色,半透明还能使小球移动有拖尾的效果
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
        //this.ctx.drawImage(this.background_img, this.ctx.canvas.width, this.ctx.canvas.height);
        //左上坐标和右下坐标
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}
