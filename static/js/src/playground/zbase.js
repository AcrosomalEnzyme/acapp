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
