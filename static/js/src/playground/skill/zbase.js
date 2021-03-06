//继承AcGameObject类
class FireBall extends AcGameObject
{
    //player判断是不是自己，不能对自己造成攻击
    //火球速度不会改变，只需要传vx,vy
    //火球需要射程，添加移动距离
    //damage是伤害，不同技能伤害不一样
    constructor(playground, player, x, y, radius, vx, vy, color, speed, move_length, damage)
    {
        //console.log("test");
        super();
        this.playground = playground;
        this.player = player;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length;
        this.damage = damage;
        this.eps = 0.1;

        //console.log("fireball: ",this.playground.players.length);
    }

    start()
    {
    }

    update()
    {
        //移动距离为0时，火球消失
        if(this.move_length < this.eps)
        {
            //console.log("test");
            this.destroy();
            return false;
        }

        //火球进行移动
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;

        //to do:火球碰撞抵消效果

        //对每一个物体进行碰撞检测
        for (let i = 0; i < this.playground.players.length; i ++ )
        {
            let player = this.playground.players[i];
            //两个玩家不相等，并且两个玩家发生碰撞了,执行攻击函数
            if (this.player !== player && this.is_collision(player) )
            {
                //攻击另一个玩家
                this.attack(player);
            }
        }

        this.render();
    }

    //写求距离函数，后期应该优化写成基类，作为工具类
    get_dist(x1, y1, x2, y2)
    {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    //判断是否碰撞玩家或者火球
    is_collision(obj)
    {
        //求出火球和目标距离
        let distance = this.get_dist(this.x, this.y, obj.x, obj.y);
        //距离小于两个球半径之和，算命中，擦边不算击中
        if (distance < this.radius + obj.radius)
            return true;
        return false;
    }

    attack(player)
    {
        //传一个击中的方向和伤害值
        let angle = Math.atan2(player.y - this.y, player.x - this.x);
        //调用player类的被攻击的函数，传入角度和伤害大小数值，执行攻击效果
        player.is_attacked(angle, this.damage);
        //被击中后，火球要消失
        this.destroy();
        //console.log("destroy");
    }



    render()
    {
        //与玩家类绘制相同，都是圆
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
        //console.log("test");
    }
}
