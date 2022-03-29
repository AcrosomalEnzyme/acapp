class AcGameMenu {
    constructor(root) {
        //传入总对象的对象
        this.root = root;
        //$：在jQuery中，HTML对象的话可以加$，普通对象不加$
        //`：类似与Python的三个```
        this.$menu = $(`
<div class="ac-game-menu">
    <div class="ac-game-menu-field">
<!--    每一项可以有多个class，用空格隔开即可，多取名字为了索引出来-->
        <div class="ac-game-menu-field-item ac-game-menu-field-item-sigle-mode">
            单人模式
        </div>
        <br>
        <div class="ac-game-menu-field-item ac-game-menu-field-item-multi-mode">
            多人模式
        </div>
        <br>
        <div class="ac-game-menu-field-item ac-game-menu-field-item-settings">
            退出登录
        </div>
    </div>
</div>
`);
        //还没有确认用户是否登录，进行隐藏
        this.$menu.hide();
        //对象创建完后，将对象添加到div中
        this.root.$ac_game.append(this.$menu);
        this.$single_mode = this.$menu.find('.ac-game-menu-field-item-sigle-mode');
        this.$multi_mode = this.$menu.find('.ac-game-menu-field-item-multi-mode');
        this.$settings= this.$menu.find('.ac-game-menu-field-item-settings');
        
        this.start();
    }



    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        //function里面的this会和外面不一样，避免混淆，提取成outer
        let outer = this;

        //点击单人模式按钮时
        this.$single_mode.click(function(){
            //先将当前对象关闭，再打开游戏界面
            outer.hide();
            //root作用体现了，root包含了playground
            outer.root.playground.show("single mode");
        });

        //点击多人模式按钮时
        this.$multi_mode.click(function(){
            outer.hide();
            outer.root.playground.show("multi mode");
        });

        //点击设置按钮时
        this.$settings.click(function(){
            outer.root.settings.logout_on_remote();
        });
    }

    //添加一个show函数和一个hide函数，显示和关闭menu界面
    show() {
        this.$menu.show();
    }

    hide() {
        this.$menu.hide();
    }


}
let AC_GAME_OBJECTS = [];

class AcGameObject {
    constructor() {
        AC_GAME_OBJECTS.push(this);

        this.has_called_start = false; //是否执行过start函数
        this.timedelta = 0; //当前帧距离上一帧的时间间隔，不同浏览器不一定每秒钟调用 requestAnimationFrame(AC_GAME_ANIMATION); 60次数。为了方便统一速度
        this.uuid = this.create_uuid();//创建唯一编号
    }

    //创建唯一编号，用于联机使用
    //使用随机的八位数
    create_uuid()
    {
        let res = "";
        for ( let i = 0; i < 8; i ++)
        {
            //返回[0,1)之间的数
            let num = parseInt(Math.floor(Math.random() * 10));
            res += num;
        }
        return res;
    }

    //只会在第一帧执行一次
    start() {
    }

    //每一帧都会执行一次
    update() {
    }

    //在被销毁前执行一次
    on_destroy() {
    }

    //删掉该物体，JavaScript中，一个对象没有被任何变量存下来便会自动被释放掉
    destroy() {
        //console.log("destroy");
        this.on_destroy();
        for (let i = 0; i < AC_GAME_OBJECTS.length; i ++)
        {
            //JavaScript中用三个等号表示全等
            if(AC_GAME_OBJECTS[i] === this)
            {
                AC_GAME_OBJECTS.splice(i,1);
                break;
            }
        }
        //console.log(AC_GAME_OBJECTS.length);

    }
}




let last_timestamp;
//timestamp时间戳，记录什么时候调用的这个函数
////timeStamp事件属性返回从文档完成加载到创建特定事件的毫秒数。
let AC_GAME_ANIMATION = function(timestamp)
{

    //length不需要加括号
    for(let i = 0; i < AC_GAME_OBJECTS.length; i ++ )
    {
        let obj = AC_GAME_OBJECTS[i];
        //如果没有被执行第一帧
        if (!obj.has_called_start)
        {
            obj.start();
            obj.has_called_start = true;
        }
        else
        {
            //记录两帧之间的时间间隔,last_timestamp不需要初始化，
            //第一次执行的时候，所有物体都是第一帧，第一帧不需要执行timedelta，要执行这一行的时候，timedelta一定是有值的
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }
    //更新时间戳
    last_timestamp = timestamp;
    //利用递归实现每一帧都调用一次这个函数
    requestAnimationFrame(AC_GAME_ANIMATION);

}

//一秒钟调用60次
requestAnimationFrame(AC_GAME_ANIMATION);
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
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        //左上坐标和右下坐标
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}
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
        //判断是否选了技能
        this.our_skill = null;

        //定义图片，用来作为头像
        //如果不是机器人绘出头像
        if(this.character !== "robot")
        {
            this.img = new Image();
            this.img.src = this.photo;
        }
    }

    start()
    {
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
            //定义一个常量，记录整个屏幕的坐标
            const rect = outer.ctx.canvas.getBoundingClientRect();
            //右键是3，左键是2
            //如果点击的是鼠标右键
            if (e.which === 3)
            {
                //调用外部的move_to函数并传入鼠标所在的位置
                //需要求出相对的坐标
                outer.move_to((e.clientX - rect.left) / outer.playground.scale, (e.clientY - rect.top) / outer.playground.scale);
            }

            //如果点击的是鼠标左键，表示即将发射技能
            //限制半径，确保玩家死亡后无法发射火球
            else if (e.which === 1 )
            {
                //通过先前判断，技能选定为火球
                if (outer.our_skill === "fireball")
                {
                    //调用发射火球函数，传入鼠标点击位置坐标
                    //需要求出相对的坐标
                    console.log("shoot");
                    outer.shoot_fireball((e.clientX - rect.left) / outer.playground.scale, (e.clientY - rect.top) / outer.playground.scale);
                }

                //释放完技能后要把当前技能置为空
                outer.our_skill = null;
            }
        });

        //获取键盘事件，canvas不能聚焦，用window获取，查keycode就行
        $(window).keydown(function(e){
            //按下键盘q时
            if (e.which === 81)
            {
                outer.our_skill = "fireball";
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
        let color = "orange";
        let speed = 0.5;
        //火球可以攻击的距离
        let move_length = 1;
        //伤害值为高度值的0.01，每次可以打掉玩家百分之20的血量
        let damage = 0.01;
        //console.log("117make fireball: ",this.playground.players.length);
        new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, damage);


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



    update() {
        this.update_move();
        this.render();

    }

    //更新玩家移动
    update_move()
    {
        this.spent_time += this.timedelta;
        //平均每5秒钟发射一次火球。因为该函数秒调用60次，每5秒调用3000次，所以5秒中之内发射一枚炮弹
        //无敌时间为4000毫秒
        //要注意判定不能自己也随机发射火球
        if (this.character === "robot" && this.spent_time > 4000 && Math.random() < 1 / 300.0)
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
    }

    //删除玩家
    on_destroy()
    {
        //console.log("on_destroy");
        for (let i = 0; i < this.playground.players.length; i ++)
        {
            if (this.playground.players[i] === this)
            {
                this.playground.players.splice(i, 1);
            }
        }
        //console.log(this.playground.players.length);
    }
}
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
        this.eps = 0.01;

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
        let scale = this.playground.scale;
        //与玩家类绘制相同，都是圆
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
        //console.log("test");
    }
}
class MultiPlayerSocket {
    constructor(playground) {
        this.playground = playground;

        //wss的链接
        this.ws = new WebSocket("wss://app1881.acapp.acwing.com.cn/wss/multiplayer/");

        this.start();
    }

    start() {
        this.receive();
    }

    //从后端接收信息
    receive()
    {
        let outer = this;

        //表示接收到信息
        this.ws.onmessage = function(e){
            //将字符串变成JSON
            let data = JSON.parse(e.data);
            let uuid = data.uuid;
            //如果是自己发送的广播，就不需要接收
            if(uuid === outer.uuid)
            {
                console.log("me");
                return false;
            }

            //console.log("create player");

            let event = data.event;
            if(event === "create_player")
            {
                outer.receive_create_player(uuid, data.username, data.photo);
            }
            //console.log(data);
        };
    }

    //发送创建玩家的消息
    send_create_player(username, photo)
    {
        let outer = this;
        //发送的API将JSON封装为字符串
        //发送信息时要携带自己的UUID，在playground中被赋值
        this.ws.send(JSON.stringify({
            //'message': "hello server",
            'event': "create_player",
            'uuid': outer.uuid,
            'username': username,
            'photo': photo,
        }));
    }

    //接收创建玩家的消息
    receive_create_player(uuid, username, photo)
    {
        let player = new Player(
            this.playground,
            this.playground.width / 2 / this.playground.scale,
            0.5,
            0.05,
            "scale",
            0.15,
            "enemy",
            username,
            photo
        )

        player.uuid = uuid;
        this.playground.players.push(player);
    }
















/*
    receive () {
        let outer = this;

        this.ws.onmessage = function(e) {
            let data = JSON.parse(e.data);
            let uuid = data.uuid;
            if (uuid === outer.uuid) return false;

            let event = data.event;
            if (event === "create_player") {
                outer.receive_create_player(uuid, data.username, data.photo);
            } else if (event === "move_to") {
                outer.receive_move_to(uuid, data.tx, data.ty);
            } else if (event === "shoot_fireball") {
                outer.receive_shoot_fireball(uuid, data.tx, data.ty, data.ball_uuid);
            } else if (event === "attack") {
                outer.receive_attack(uuid, data.attackee_uuid, data.x, data.y, data.angle, data.damage, data.ball_uuid);
            } else if (event === "blink") {
                outer.receive_blink(uuid, data.tx, data.ty);
            } else if (event === "message") {
                outer.receive_message(uuid, data.username, data.text);
            }
        };
    }
    send_create_player(username, photo) 
    {
        let outer = this;
        //发送的API将JSON封装为字符串
        this.ws.send(JSON.stringify({
            'event': "create_player",
            'uuid': outer.uuid,
            'username': username,
            'photo': photo,
        }));
    }
/*
    get_player(uuid) {
        let players = this.playground.players;
        for (let i = 0; i < players.length; i ++ ) {
            let player = players[i];
            if (player.uuid === uuid)
                return player;
        }

        return null;
    }
    receive_create_player(uuid, username, photo)
    {
        let player = new Player(
            this.playground,
            this.playground.width / 2 / this.playground.scale,
            0.5,
            0.05,
            "white",
            0.15,
            "enemy",
            username,
            photo,
        );

        player.uuid = uuid;
        this.playground.players.push(player);
    }
/*
    send_move_to(tx, ty) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "move_to",
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty,
        }));
    }

    receive_move_to(uuid, tx, ty) {
        let player = this.get_player(uuid);

        if (player) {
            player.move_to(tx, ty);
        }
    }

    send_shoot_fireball(tx, ty, ball_uuid) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "shoot_fireball",
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty,
            'ball_uuid': ball_uuid,
        }));
    }

    receive_shoot_fireball(uuid, tx, ty, ball_uuid) {
        let player = this.get_player(uuid);
        if (player) {
            let fireball = player.shoot_fireball(tx, ty);
            fireball.uuid = ball_uuid;
        }
    }

    send_attack(attackee_uuid, x, y, angle, damage, ball_uuid) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "attack",
            'uuid': outer.uuid,
            'attackee_uuid': attackee_uuid,
            'x': x,
            'y': y,
            'angle': angle,
            'damage': damage,
            'ball_uuid': ball_uuid,
        }));
    }

    receive_attack(uuid, attackee_uuid, x, y, angle, damage, ball_uuid) {
        let attacker = this.get_player(uuid);
        let attackee = this.get_player(attackee_uuid);

        if (attacker && attackee) {
            attackee.receive_attack(x, y, angle, damage, ball_uuid, attacker);
        }
    }

    send_blink(tx, ty) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "blink",
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty,
        }));
    }

    receive_blink(uuid, tx, ty) {
        let player = this.get_player(uuid);
        if (player) {
            player.blink(tx, ty);
        }
    }

    send_message(username, text) {
        let outer =this;
        this.ws.send(JSON.stringify({
            'event': "message",
            'uuid': outer.uuid,
            'username': username,
            'text': text,
        }));
    }

    receive_message(uuid, username, text) {
        this.playground.chat_field.add_message(username, text);
    }

*/
}



class AcGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`<div class="ac-game-playground"></div>`);
        //加入到父对象之前要关掉，用hide
        this.hide();

        this.root.$ac_game.append(this.$playground);

        this.start();

    }

    //产生随机的颜色
    get_random_color()
    {
        let colors = ["blue", "red", "pink", "grey", "green", "purple"];
        //floor是向下取整
        return colors[Math.floor(Math.random() * 6)];
    }

    start()
    {
        let outer = this;
        //表示窗口大小被改变即触发函数
        $(window).resize(function(){
            outer.resize();
        });
    }

    //修改地图大小
    resize()
    {
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        //求单位长度，使长宽比为16:9
        let unit = Math.min(this.width / 16, this.height / 9);
        this.width = unit * 16;
        this.height = unit * 9;
        //高度设定为基准
        this.scale = this.height;

        if(this.game_map)
            this.game_map.resize();

    }


    show(mode) {
        let outer = this;
        this.$playground.show();

        this.width = this.$playground.width();
        this.height = this.$playground.height();

        //添加地图
        this.game_map = new GameMap(this);

        this.resize();

        //添加玩家
        this.players = [];
        //绘制在画面中间
        this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, "white", 0.15, "me", this.root.settings.username, this.root.settings.photo));

        //如果是单人模式，添加机器人
        if (mode === "single mode")
        {
            //添加5个敌人
            for(let i = 0; i < 5; i ++ )
            {
                //添加敌人，不是自己，置为false
                this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, this.get_random_color(), 0.15, "robot"));
            }
        }
        //如果是联机模式
        else if (mode === "multi mode")
        {
            //创建ws连接
            this.mps = new MultiPlayerSocket (this);

            //创建连接后，给让mps的UUID等于自己窗口控制的player的UUID
            this.mps.uuid = this.players[0].uuid;

            //连接创建成功会调用该函数创建用户
            this.mps.ws.onopen = function(){
                outer.mps.send_create_player(outer.root.settings.username, outer.root.settings.photo);
            };
        }
    }

    hide() {
        this.$playground.hide();
    }

    /*
    destroy_players(player)
    {
        for(let i = 0; i < this.players.length; i ++)
        {
            if(players[i] === player)
            {
                players.splice(i, 1);
                break;
            }
        }
    }
    */

}
class Settings
{
    constructor(root)
    {
        this.root = root;
        //默认是web平台
        this.platform = "WEB";
        if (this.root.AcWingOS)
            this.platform = "ACAPP";
        this.username = "";
        this.photo = "";

        //渲染登录界面
        this.$settings = $(`
            <div class="ac-game-settings">


                <div class="ac-game-settings-login">


                    <div class="ac-game-settings-title">
                        登录
                    </div>


                    <div class="ac-game-settings-username">
                        <div class="ac-game-settings-item">
                            <input type="text" placeholder="用户名">
                        </div>
                    </div>


                    <div class="ac-game-settings-password">
                        <div class="ac-game-settings-item">
                            <input type="password" placeholder="密码">
                        </div>
                    </div>


                    <div class="ac-game-settings-submit">
                        <div class="ac-game-settings-item">
                            <button>登录</button>
                        </div>
                    </div>


                    <div class="ac-game-settings-error-message">
                        
                    </div>


                    <div class="ac-game-settings-option">
                        注册
                    </div>


                    <br>
                    <div class="ac-game-settings-acwing">
                        <img width="30" src="https://app1881.acapp.acwing.com.cn/static/image/settings/acwing_logo.png">
                        <br>
                        <div>
                            AcWing一键登录
                        </div>
                    </div>


                </div>







                <div class="ac-game-settings-register">

                    <div class="ac-game-settings-title">
                        注册
                    </div>


                    <div class="ac-game-settings-username">
                        <div class="ac-game-settings-item">
                            <input type="text" placeholder="用户名">
                        </div>
                    </div>


                    <div class="ac-game-settings-password ac-game-settings-password-first">
                        <div class="ac-game-settings-item">
                            <input type="password" placeholder="密码">
                        </div>
                    </div>


                    <div class="ac-game-settings-password ac-game-settings-password-second">
                        <div class="ac-game-settings-item">
                            <input type="password" placeholder="确认密码">
                        </div>
                    </div>


                    <div class="ac-game-settings-submit">
                        <div class="ac-game-settings-item">
                            <button>注册</button>
                        </div>
                    </div>


                    <div class="ac-game-settings-error-message">
                        
                    </div>


                    <div class="ac-game-settings-option">
                        登录
                    </div>


                    <br>
                    <div class="ac-game-settings-acwing">
                        <img width="30" src="https://app1881.acapp.acwing.com.cn/static/image/settings/acwing_logo.png">
                        <br>
                        <div>
                            AcWing一键登录
                        </div>
                    </div>


                </div>
            </div>
        `);

        //提取出整个登录框
        this.$login = this.$settings.find(".ac-game-settings-login");
        //提取相应的信息，不是相邻两级，不用 >
        this.$login_username = this.$login.find(".ac-game-settings-username input");
        this.$login_password = this.$login.find(".ac-game-settings-password input");
        this.$login_submit = this.$login.find(".ac-game-settings-submit button");
        this.$login_error_message = this.$login.find(".ac-game-settings-error-message");
        this.$login_register = this.$login.find(".ac-game-settings-option");
        this.$login.hide();

        //提取出整个注册框
        this.$register = this.$settings.find(".ac-game-settings-register");
        //提取出相应的信息
        this.$register_username = this.$register.find(".ac-game-settings-username input");
        this.$register_password = this.$register.find(".ac-game-settings-password-first input");
        this.$register_password_confirm = this.$register.find(".ac-game-settings-password-second input");
        this.$register_submit = this.$register.find(".ac-game-settings-submit button");
        this.$register_error_message = this.$register.find(".ac-game-settings-error-message");
        this.$register_login = this.$register.find(".ac-game-settings-option");

        this.$register.hide();

        this.$acwing_login = this.$settings.find(".ac-game-settings-acwing img");

        this.root.$ac_game.append(this.$settings);


        this.start();
    }

    start()
    {
        //判断是web端还是acapp端登录
        if (this.platform === "ACAPP")
        {
            this.getinfo_acapp();
        }
        else
        {
        //从服务器端获取信息
        this.getinfo_web();
        //绑定监听函数
        this.add_listening_events();
        }
    }

    //统一绑定监听函数
    add_listening_events()
    {
        let outer = this;
        this.add_listening_events_login();
        this.add_listening_events_register();
        this.$acwing_login.click(function(){
            outer.acwing_login();
        });
    }

    //登录界面监听函数
    add_listening_events_login()
    {
        //有click函数都需要定义outer
        let outer = this;

        //切换注册界面的监听函数
        this.$login_register.click(function(){
            outer.register();
        });

        //登录按钮的监听函数
        this.$login_submit.click(function(){
            outer.login_on_remote();
        });
    }

    //注册界面的监听函数
    add_listening_events_register()
    {
        let outer = this;

        //切换登录界面的监听函数
        this.$register_login.click(function(){
            outer.login_on_remote();
        });

        //注册按钮的监听函数
        this.$register_submit.click(function(){
            outer.register_on_remote();
        });
    }

    //acwing一键登录
    acwing_login()
    {
        $.ajax({
            url: "https://app1881.acapp.acwing.com.cn/settings/acwing/web/apply_code/",
            type: "GET",
            success: function(res){
                console.log(res);
                if (res.result === "success")
                {
                    window.location.replace(res.apply_code_url);
                }
            }
        });
    }

    //在远程服务器上登录
    login_on_remote()
    {
        let outer = this;
        //获取用户输入的用户名和密码
        //val表示取出input的值
        let username = this.$login_username.val();
        let password = this.$login_password.val();

        //每次点击要清空错误信息
        this.$login_error_message.empty();

        $.ajax({
            url: "https://app1881.acapp.acwing.com.cn/settings/login/",
            type: "GET",
            data: {
                username: username,
                password: password,
            },
            success: function(res){
                console.log(res);
                if (res.result === "success")
                {
                    //登录成功就刷新网页，
                    //这样就能通过调用getinfo，加载出菜单界面
                    location.reload();
                }
                else
                {
                    //登录失败就显示失败信息
                    outer.$login_error_message.html(res.result);
                }
            }
        });
    }

    //在远程服务器上注册
    register_on_remote()
    {
        let outer = this;
        let username = this.$register_username.val();
        let password = this.$register_password.val();
        let password_confirm = this.$register_password_confirm.val();
        this.$register_error_message.empty();

        console.log(password);
        console.log(password_confirm);

        $.ajax({
            url: "https://app1881.acapp.acwing.com.cn/settings/register/",
            type: "GET",
            data: {
                username: username,
                password: password,
                password_confirm: password_confirm,
            },
            success: function(res){
                console.log(res);
                if(res.result === "success")
                {
                    location.reload();
                }
                else
                {
                    outer.$register_error_message.html(res.result);
                }
            }
        })
    }

    //在远程服务器上登出
    logout_on_remote()
    {
        //如果登录平台是ACAPP，不执行接下来的操作
        if (this.platform === "ACAPP") return false;

        $.ajax({
            url: "https://app1881.acapp.acwing.com.cn/settings/logout/",
            type: "GET",
            success: function(res){
                console.log(res);
                if (res.result === "success")
                {
                    location.reload();
                }
            }
        });
    }

    //打开登录界面
    login()
    {
        this.$register.hide();
        this.$login.show();
    }

    //打开注册界面
    register()
    {
        this.$login.hide();
        this.$register.show();
    }

    //在acapp端登录
    acapp_login(appid, redirect_uri, scope, state)
    {
        let outer = this;
        this.root.AcWingOS.api.oauth2.authorize(appid, redirect_uri, scope, state, function(res){
            console.log(res);
            if (res.result === "success")
            {
                outer.username = res.username;
                outer.photo = res.photo;
                outer.hide();
                outer.root.menu.show();
            }
        });

    }

    //获取用户是否登录的状态，acapp端
    getinfo_acapp()
    {
        let outer = this;
        $.ajax({
            url: "https://app1881.acapp.acwing.com.cn/settings/acwing/acapp/apply_code/",
            type: "GET",
            success: function(res){
                if(res.result === "success")
                {
                    outer.acapp_login(res.appid, res.redirect_uri, res.scope, res.state);
                }

            }
        })
    }

    //获取用户是否登录的状态，web端
    getinfo_web()
    {
        //为了记录外部的“this”
        let outer = this;
        $.ajax({
            //像相应的链接发送请求
            url:"https://app1881.acapp.acwing.com.cn/settings/getinfo/",
            type:"GET",
            data:{
                platform: outer.platform,
            },
            success: function(res)
            {
                console.log(res);
                if(res.result === "success")
                {
                    //记录传回来的用户名称和头像
                    outer.username = res.username;
                    outer.photo = res.photo;
                    //把当前界面隐藏，并展示菜单界面
                    outer.hide();
                    outer.root.menu.show();
                }
                else
                {
                    outer.login();
                }
            }
        });
    }

    //整个界面都隐藏，无论登录或者注册
    hide()
    {
        this.$settings.hide();
    }

    //整个界面都展示
    show()
    {
        this.$settings.hide();
    }
}
//模块化需要加export
export class AcGame {
    //通过是否有AcwingOS参数判断是否在是ACAPP中调用的
    constructor(id, AcWingOS) {
        console.log(AcWingOS);
        //id：div的id
        this.id = id;
        this.$ac_game = $('#' + id);

        //如果是ACAPP调用的，其中包含参数
        this.AcWingOS = AcWingOS;


        //三者顺序不能变化，不然会有先运用再定义的情况
        this.settings = new Settings(this);
        this.menu = new AcGameMenu(this);
        this.playground = new AcGamePlayground(this);

        this.start();
    }

    //充创建游戏界面对象，补充start函数，start函数可以看做构造函数的延伸
    start() {
    }
}

//流程顺序（很重要）：
// 用户客户端发现有代码要执行，要创建一个class（new AcGame("ac_game_12345678")）
// 因此调用class的构造函数，位于src文件夹的zbase.js的构造函数
//
// 先赋予id：（"ac_game_12345678"）
// this.$ac_game = $('#' + id);------------> 利用jQuery选择器获得<div id="ac_game_12345678"></div>，ac_game变成了<div id="ac_game_12345678"></div>
//
// 创建并构造menu，调用位于menu文件夹的构造函数（this.menu = new AcGameMenu(this);），ac_game被传入，作为root
// 为前面代码中创建的menu赋予一段HTML对象：
//         this.$menu = $(`<div class="ac-game-menu"></div>`);
// 然后再将这段代码存进存进ac_game中，即存进了div中

//流程：通过路由，进入view，返回HTML文件，检测js代码并执行，其中包含生成和创建一个ac_game对象，会调用构造函数，
// 里面包含了创建menu对象和playground对象，创建menu对象的时候会把menu的HTML界面渲染出。
