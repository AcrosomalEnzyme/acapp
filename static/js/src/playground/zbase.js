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
