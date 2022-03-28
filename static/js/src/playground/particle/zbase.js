class Particle extends AcGameObject{
    //需要传入粒子位置的坐标，速度方向，大小，颜色
    //需要绘画，需要ctx，所以也要传入playground
    //移动的距离要有限制
    constructor(playground, x, y, radius, vx, vy, color, speed, move_length) {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length;
        this.friction = 0.9;
        this.eps = 0.01;
    }

    start()
    {}

    update()
    {
        //判断速度小于0或者设定的距离小于0的时候粒子消失
        if (this.move_length < this.eps || this.speed < this.eps)
        {
            this.destroy();
            return false;
        }

        let moved= Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.speed *= this.friction;
        this.move_length -= moved;
        
        this.render();
    }

    render()
    {
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}
