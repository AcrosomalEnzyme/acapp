//玩家也是object
class Player extends AcGameObject {

    //玩家的坐标，半径，颜色（后续开发可以把颜色换成头像），
    //每秒钟移动百分之多少，用高度的百分比，使得游戏公平
    //判断是不是自己
    constructor(playground, x, y, radius, color, speed, character, username, photo) {
        //调用基类的构造函数，实现每秒钟刷新60次
        super();
        this.playground = playground;
        //ctx是画布的引用
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.vx = 1;
        this.vy = 1;
        //受到伤害的方向和速度
        this.damage_x = 0;
        this.damage_y = 0;
        this.damage_speed = 0;
        this.move_length = 0;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.character = character;
        this.username = username;
        this.photo = photo;
        //移动的时候涉及浮点运算，eps表示小于多少算0，设定为0.01；
        this.eps = 0.01;
        //判断被伤害攻击之后的阻尼
        this.friction = 0.9;
        //设置游戏无敌时间
        this.spent_time = 0;
        //绘画火球技能
        //判断是否选了技能
        this.our_skill = null;

        //联机的时候子弹会消失，需要记录
        this.fireballs = [];

        //定义图片，用来作为头像
        //如果不是机器人绘出头像
        if(this.character !== "robot")
        {
            this.img = new Image();
            this.img.src = this.photo;
        }

        //如果是自己，有技能冷却时间
        if (this.character === "me")
        {
            //发射火球技能
            this.fireball_coldtime = 3;
            this.fireball_img = new Image();
            //绘画火球技能
            this.fireball_img.src = "https://app1881.acapp.acwing.com.cn/static/image/playground/fireball.png";

            //闪现技能
            this.blink_coldtime = 5;
            this.blink_img = new Image();
            this.blink_img.src = "https://app1881.acapp.acwing.com.cn/static/image/playground/blink.png";
        }
    }

    start()
    {
        this.playground.player_count ++;
        this.playground.notice_board.write("房间内人数：" + this.playground.player_count + "人");

        //如果房间内玩家人数大于等于3人开始游戏
        if(this.playground.player_count >=3)
        {
            //进入到游戏状态
            this.playground.state = "fighting";
            this.playground.notice_board.write("游戏开始");
        }

        //只有玩家才绑定监听函数用于鼠标操控
        if (this.character === "me")
        {
            this.add_listening_events();
        }
        //如果不是玩家，是电脑敌人
        else if (this.character === "robot")
        {
            //为游戏随机一个目的地
            let tx = Math.random() * this.playground.width / this.playground.scale;
            let ty = Math.random() * this.playground.height / this.playground.scale;
            this.move_to(tx, ty);

        }
    }

    //添加监听函数，用于鼠标操控玩家，获取键盘事件
    add_listening_events() {

        //代表外部变量，下面鼠标点击的地方的时候使用，不能用this，二者指代不同
        let outer = this;

        //关闭鼠标右键菜单
        this.playground.game_map.$canvas.on("contextmenu", function(){
            return false;
        });

        //读取右键点击的时候鼠标的坐标
        this.playground.game_map.$canvas.mousedown(function(e){

            //如果游戏没有进入战斗状态，直接返回
            if(outer.playground.state !== "fighting")

                return true;

            //定义一个常量，记录整个屏幕的坐标
            const rect = outer.ctx.canvas.getBoundingClientRect();
            //右键是3，左键是2
            //如果点击的是鼠标右键
            if (e.which === 3)
            {
                let tx = (e.clientX - rect.left) / outer.playground.scale;
                let ty = (e.clientY - rect.top) / outer.playground.scale;
                //调用外部的move_to函数并传入鼠标所在的位置
                //需要求出相对的坐标
                outer.move_to(tx, ty);

                //如果是多人模式，要将移动位置进行广播
                if (outer.playground.mode === "multi mode")
                {
                    outer.playground.mps.send_move_to(tx, ty);
                }
            }

            //如果点击的是鼠标左键，表示即将发射技能
            //限制半径，确保玩家死亡后无法发射火球
            else if (e.which === 1 )
            {
                //传入鼠标点击位置坐标
                //需要求出相对的坐标
                let tx = (e.clientX - rect.left) / outer.playground.scale;
                let ty = (e.clientY - rect.top) / outer.playground.scale;

                //通过先前判断，技能选定为火球
                if (outer.our_skill === "fireball")
                {
                    //如果技能还在冷却时间，直接返回
                    if (outer.fireball_coldtime > outer.eps)
                        return true;
                    //调用发射火球函数
                    let fireball = outer.shoot_fireball(tx, ty);

                    //console.log(this.playground.players.length);
                    //如果是多人模式需要传递火球信息
                    if(outer.playground.mode === "multi mode")
                    {
                        outer.playground.mps.send_shoot_fireball(tx, ty, fireball.uuid);
                    }
                }
                //如果技能为闪现
                else if (outer.our_skill === "blink")
                {
                    //如果技能还在冷却时间，直接返回
                    if (outer.blink_coldtime > outer.eps)
                        return true;
                    outer.blink(tx, ty);

                     //如果是多人模式需要传递闪现信息
                    if (outer.playground.mode === "multi mode")
                    {
                        outer.playground.mps.send_blink(tx, ty);
                    }
                }

                //释放完技能后要把当前技能置为空
                outer.our_skill = null;
            }
        });

        //获取键盘事件，canvas不能聚焦，用window获取，查keycode就行
        this.playground.game_map.$canvas.keydown(function(e){

            //添加聊天的绑定
            //回车键是13，esc键是27
            //按下回车，打开聊天框
            if (e.which === 13)
            {
                //console.log("test");
                if (outer.playground.mode === "multi mode")
                {
                    //console.log("test2");
                    outer.playground.chat_field.show_input();
                    return false;
                }
            }
            //按下esc键，退出聊天框
            else if (e.which === 27)
            {
                if (outer.playground.mode === "multi mode")
                {
                    outer.playground.chat_field.hide_input();
                    return false;
                }
            }

            //如果游戏没有进入战斗状态，直接返回
            if(outer.playground.state !== "fighting")
                return true;

            //按下键盘q时
            if (e.which === 81)
            {
                //如果技能还在冷却时间，直接返回
                if (outer.fireball_coldtime > outer.eps)
                    return false;

                outer.our_skill = "fireball";
                return false;
            }
            //按下键盘f时
            else if (e.which === 70)
            {
                if (outer.blink_coldtime > outer.eps)
                    return false;

                outer.our_skill = "blink";
                return false;
            }

        });
    }

    //处理发射火球的函数，传入鼠标点击的位置
    shoot_fireball(tx, ty)
    {
        //火球初始位置与玩家球中心点位置一样
        let x = this.x, y = this.y;
        //火球半径与界面半径相关，这样能确保显示效果一样
        let radius = 0.01;
        //确定一下角度
        let angle = Math.atan2(ty - this.y, tx - this.x);
        //确定运动的方向
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let color = "yellow";
        let speed = 0.5;
        //火球可以攻击的距离
        let move_length = 1;
        //伤害值为高度值的0.01，每次可以打掉玩家百分之20的血量
        let damage = 0.01;
        //console.log("117make fireball: ",this.playground.players.length);
        let fireball = new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, damage);
        //存下火球，用于联机同步使用
        this.fireballs.push(fireball);

        //重置CD
        this.fireball_coldtime = 3;

        return fireball;
    }

    //删除火球
    destroy_fireball(uuid)
    {
        for (let i = 0; i < this.fireballs.length; i ++ )
        {
            let fireball = this.fireballs[i];
            if (fireball.uuid === uuid)
            {
                fireball.destroy();
                break;
            }
        }
    }


    //闪现的技能
    blink(tx, ty)
    {
        let d = this.get_dist(this.x, this.y, tx, ty);
        d = Math.min(d, 0.8);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.x += d * Math.cos(angle);
        this.y += d * Math.sin(angle);

        //重置CD
        this.blink_coldtime = 5;
        //闪现之后停下
        this.move_length = 0;

    }



    //获取两点之间的距离
    get_dist(x1, y1, x2, y2)
    {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }


    //根据鼠标点击的位置，求出对应的信息
    move_to(tx, ty)
    {
        //求移动的长度，tx,ty是传进来鼠标点击的位置
        this.move_length = this.get_dist(this.x, this.y, tx, ty);
        //求角度
        let angle = Math.atan2(ty - this.y, tx - this.x);
        //求水平方向和竖直方向的角度，注意这里不是速度值，代表的是方向
        this.vx = Math.cos(angle);
        this.vy = Math.sin(angle);
    }

    //玩家被攻击的函数，传入攻击角度和伤害值
    is_attacked(angle, damage)
    {
        //添加粒子效果，生成粒子可以5-15个之间随机
        for (let i = 0; i < 10 + Math.random() * 10; i ++)
        {
            //从中心炸开
            let x = this.x, y = this.y;
            //生成的粒子大小与当前球的大小有关
            let radius = this.radius * Math.random() * 0.1;
            //角度大小也是随机的
            let angle = Math.PI * 2 * Math.random();
            let vx = Math.cos(angle), vy = Math.sin(angle);
            let color = this.color;
            //速度与当前速度也有关系
            let speed = this.speed * 10;
            //移动的长度和半径相关
            let move_length = this.radius * Math.random() * 5;
            new Particle(this.playground, x, y, radius, vx, vy, color, speed, move_length);
        }


        //玩家半径代表血量
        this.radius -= damage;
        //玩家半径低于10像素，该物体死亡，销毁object
        if(this.radius < this.eps)
        {
            this.destroy();
            //console.log("destroy");
            //destroy_players(this);
            return false;
        }
        //没有死亡，给予冲击力
        //受到伤害的角度和后退速度，速度和受到伤害有关
        this.damage_x = Math.cos(angle);
        this.damage_y = Math.sin(angle);
        this.damage_speed = damage * 100;
        //受到攻击速度会变慢
        this.speed *= 0.8;
    }

    //处理接收到被攻击的信息
    receive_attack(x, y, angle, damage, ball_uuid, attacker)
    {
        attacker.destroy_fireball(ball_uuid);
        this.x = x;
        this.y = y;
        this.is_attacked(angle, damage);
    }



    update() {
        this.spent_time += this.timedelta / 1000;

        if (this.character === "me" && this.playground.state === "fighting")
        {
            this.update_coldtime();
        }

        this.update_move();
        this.render();
        this.update_win();

    }

    //判定是否胜利
    update_win()
    {
        if (this.playground.state === "fighting" && this.character === "me" && this.playground.players.length === 1)
        {
            this.playground.state = "over";
            this.playground.score_board.win();
        }
    }

    //更新技能冷却时间
    update_coldtime()
    {
        this.fireball_coldtime -= this.timedelta / 1000;
        this.fireball_coldtime = Math.max(this.fireball_coldtime, 0);

        this.blink_coldtime -= this.timedelta / 1000;
        this.blink_coldtime = Math.max(this.blink_coldtime, 0);
    }

    //更新玩家移动
    update_move()
    {
        //平均每5秒钟发射一次火球。因为该函数秒调用60次，每5秒调用3000次，所以5秒中之内发射一枚炮弹
        //无敌时间为4000毫秒
        //要注意判定不能自己也随机发射火球
        if (this.character === "robot" && this.spent_time > 4 && Math.random() < 1 / 300.0)
        {
            //朝一个随机的敌人发射炮弹
            //to do:解方程，预测玩家位置，往目标位置发射，先实现简易的
            let player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)];
            //往一秒钟之后的位置射击
            let tx = player.x + player.speed * this.vx * this.timedelta / 1000 * 1;
            let ty = player.y + player.speed * this.vy * this.timedelta / 1000 * 1;
            this.shoot_fireball(tx, ty);

        }

        //如果还受到伤害后退的影响，不能进行操控
        if (this.damage_speed > this.eps)
        {
            //受到伤害过程中，速度清零
            this.vx = this.vy = 0;
            this.move_length = 0;
            //变为伤害方向移动
            this.x += this.damage_x * this.damage_speed * this.timedelta / 1000;
            this.y += this.damage_y * this.damage_speed * this.timedelta / 1000;
            //增加阻尼
            this.damage_speed *= this.friction;
        }
        else
        {
            //需要求出相对的坐标
            //console.log(1,this.move_length , this.eps);
            //当需要移动的距离小于临界值时
            if (this.move_length < this.eps)
            {
                this.move_length = 0;
                //速度置为0
                this.vx = this.vy = 0;
                //还需要进行判定，不是玩家的话，不进行销毁，而是重新随机一个目标地点再移动
                if(this.character === "robot")
                {
                    //console.log("test");
                    let tx = Math.random() * this.playground.width / this.playground.scale;
                    let ty = Math.random() * this.playground.height / this.playground.scale;
                    this.move_to(tx, ty);
                }
            }
            else
            {
                //求每一帧真实移动的距离，取二者之间的最小值，避免移动出界
                let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
                //这里可以看做“速度”，即每一帧移动的距离
                this.x += this.vx * moved;
                this.y += this.vy * moved;
                this.move_length -= moved;
            }
        }
    }

    render()
    {
        let scale = this.playground.scale;
        //如果不是机器人，画头像
        if (this.character !== "robot")
        {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, (this.x - this.radius) * scale, (this.y - this.radius) * scale, this.radius * 2 * scale, this.radius * 2 * scale);
            this.ctx.restore();
        }
        //如果是电脑，画颜色
        else
        {
            //画出一个圆
            this.ctx.beginPath();
            //起始坐标，半径，起始角度，是否顺时针
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            //颜色
            this.ctx.fillStyle = this.color;
            //把颜色填充进去
            this.ctx.fill();
        }

        //只有是自己才渲染技能的冷却时间
        if(this.character === "me" && this.playground.state === "fighting")
        {
            this.render_skill_coldtime();
        }
    }


    //渲染技能的冷却时间
    render_skill_coldtime()
    {
        let scale = this.playground.scale;

        //绘画火球技能
        let x = 1.5, y = 0.9, r = 0.05;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.fireball_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();

        //绘画技能冷却效果
        if(this.fireball_coldtime > 0)
        {
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(x * scale, y * scale, r * scale, - Math.PI / 2, Math.PI * 2 * (1 - this.fireball_coldtime / 3) - Math.PI / 2, true);
            this.ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
            this.ctx.fill();
        }

        //绘画闪现技能
        x = 1.62, y = 0.9, r = 0.053;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.blink_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();

        //绘画技能冷却效果
        if(this.blink_coldtime > 0)
        {
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(x * scale, y * scale, r * scale, - Math.PI / 2, Math.PI * 2 * (1 - this.blink_coldtime / 5) - Math.PI / 2, true);
            this.ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
            this.ctx.fill();
        }
    }





    //删除玩家
    on_destroy()
    {
        //死亡之后进入游戏结束状态
        if (this.character === "me" && this.playground.state === "fighting")
        {
            this.playground.state = "over";
            this.playground.score_board.lose();
        }
            //console.log("on_destroy");
        for (let i = 0; i < this.playground.players.length; i ++)
        {
            if (this.playground.players[i] === this)
            {
                this.playground.players.splice(i, 1);
                break;
            }
        }
        //console.log(this.playground.players.length);
    }
}
