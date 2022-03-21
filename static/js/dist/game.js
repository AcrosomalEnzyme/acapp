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
            设置
        </div>
    </div>
</div>
`);
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
        this.$single_mode.click(function(){
            //先将当前对象关闭，再打开游戏界面
            outer.hide();
            //root作用体现了，root包含了playground
            outer.root.playground.show();
        });
        this.$multi_mode.click(function(){
            console.log("click multi mode");
        });
        this.$settings.click(function(){
            console.log("click settings");
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
        this.eps = 1;
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
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}
//玩家也是object
class Player extends AcGameObject {
    //玩家的坐标，半径，颜色（后续开发可以把颜色换成头像），
    //每秒钟移动百分之多少，用高度的百分比，使得游戏公平
    //判断是不是自己
    constructor(playground, x, y, radius, color, speed, is_me) {
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
        this.is_me = is_me;
        //移动的时候涉及浮点运算，eps表示小于多少算0，设定为0.1；
        this.eps = 0.01;
        //判断被伤害攻击之后的阻尼
        this.friction = 0.9;
        //设置游戏无敌时间
        this.spent_time = 0;
        //判断是否选了技能
        this.our_skill = null;

    }

    start()
    {
        //只有玩家才绑定监听函数用于鼠标操控
        if (this.is_me)
        {
            this.add_listening_events();
        }
        //如果不是玩家，是电脑敌人
        else
        {
            //为游戏随机一个目的地
            let tx = Math.random() * this.playground.width;
            let ty = Math.random() * this.playground.height;
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
                outer.move_to(e.clientX - rect.left, e.clientY - rect.top);
            }

            //如果点击的是鼠标左键，表示即将发射技能
            //限制半径，确保玩家死亡后无法发射火球
            else if (e.which === 1 && outer.radius > 10)
            {
                //通过先前判断，技能选定为火球
                if (outer.our_skill === "fireball")
                {
                    //调用发射火球函数，传入鼠标点击位置坐标
                    //需要求出相对的坐标
                    outer.shoot_fireball(e.clientX - rect.left, e.clientY - rect.top);
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
        let radius = this.playground.height * 0.01;
        //确定一下角度
        let angle = Math.atan2(ty - this.y, tx - this.x);
        //确定运动的方向
        let vx = Math.cos(angle), vy = Math.sin(angle);
        let color = "orange";
        let speed = this.playground.height * 0.5;
        //火球可以攻击的距离
        let move_length = this.playground.height * 1;
        //伤害值为高度值的0.01，每次可以打掉玩家百分之20的血量
        let damage = this.playground.height * 0.01;
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
        if(this.radius < 10)
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
        this.spent_time += this.timedelta;
        //平均每5秒钟发射一次火球。因为该函数秒调用60次，每5秒调用3000次，所以5秒中之内发射一枚炮弹
        //无敌时间为4000毫秒
        //要注意判定不能自己也随机发射火球
        if (!this.is_me && this.spent_time > 4000 && Math.random() < 1 / 300.0)
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
        if (this.damage_speed > 10)
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
                if(!this.is_me)
                {
                    //console.log("test");
                    let tx = Math.random() * this.playground.width;
                    let ty = Math.random() * this.playground.height;
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
        this.render();

    }

    render()
    {
            //画出一个圆
            this.ctx.beginPath();
            //起始坐标，半径，起始角度，是否顺时针
            this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            //颜色
            this.ctx.fillStyle = this.color;
            //把颜色填充进去
            this.ctx.fill();
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
class AcGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`<div class="ac-game-playground"></div>`);
        //加入到父对象之前要关掉，用hide
        this.hide();

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
    }


    show() {
        this.$playground.show();
        this.root.$ac_game.append(this.$playground);

        this.width = this.$playground.width();
        this.height = this.$playground.height();

        //添加地图
        this.game_map = new GameMap(this);
        //添加玩家
        this.players = [];
        //绘制在画面中间
        this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, "white", this.height * 0.15, true));

        //添加5个敌人
        for(let i = 0; i < 5; i ++ )
        {
            //添加敌人，不是自己，置为false
            this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, this.get_random_color(), this.height * 0.15, false));
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
//模块化需要加export
export class AcGame {
    constructor(id) {
        //id：div的id
        this.id = id;
        this.$ac_game = $('#' + id);
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
