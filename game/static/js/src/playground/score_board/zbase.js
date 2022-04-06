class ScoreBoard extends AcGameObject
{
    constructor(playground)
    {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;

        //win表示胜利，lose表示失败
        this.state = null;

        //胜利和失败的图标
        this.win_img = new Image();
        this.win_img.src = "https://app1881.acapp.acwing.com.cn/static/image/playground/win2.png"

        this.lose_img = new Image();
        this.lose_img.src = "https://app1881.acapp.acwing.com.cn/static/image/playground/lose2.png"

        this.start();
    }

    add_listening_events()
    {
        let outer = this;
        let $canvas = this.playground.game_map.$canvas;

        //点击鼠标左键返回菜单
        $canvas.on('click', function()
        {
            outer.playground.hide();
            outer.playground.root.menu.show();
        });

    }

    //胜利的函数
    win()
    {
        this.state = "win";
        let outer = this;
        //一秒钟后才能点击返回
        setTimeout(function()
            {
                outer.add_listening_events();
            }, 1000);

    }

    //失败的函数
    lose()
    {
        this.state = "lose";
        let outer = this;
        setTimeout(function()
            {
                outer.add_listening_events();
            }, 1000);

    }

    start()
    {
    }

    late_update()
    {
        this.render();
    }

    render()
    {
        let len = this.playground.height / 2;

        if (this.state === "win")
        {
            this.ctx.drawImage(this.win_img, this.playground.width / 2 - len, this.playground.height / 2 - len / 2, len * 2, len);
        }
        else if (this.state === "lose")
        {
            this.ctx.drawImage(this.lose_img, this.playground.width / 2 - len, this.playground.height / 2 - len / 2, len * 2, len);
        }

    }
}
