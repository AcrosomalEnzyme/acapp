class ChatField
{
    constructor(playground)
    {
        this.playground = playground;

        //历史记录和输入框
        this.$history = $(`<div class="ac-game-chat-field-history"></div>`);
        this.$input = $(`<input type="text" class="ac-game-chat-field-input">`);

        this.$history.hide();
        this.$input.hide();

        this.playground.$playground.append(this.$history);
        this.playground.$playground.append(this.$input);

        this.func_id = null;

        this.start();
    }

    start()
    {
        this.add_listening_events();
    }

    //添加监听函数，防止打开聊天框之后因为focus在canvas
    //按esc没有反应
    add_listening_events()
    {
        let outer = this;

        this.$input.keydown(function(e){
            //如果是esc键
            if (e.which === 27)
            {
                outer.hide_input();
                return false;
            }
            //如果是回车键，发送消息
            else if (e.which === 13)
            {
                let username = outer.playground.root.settings.username;
                let text = outer.$input.val();
                //如果输入的信息不为空
                if (text)
                {
                    //清空消息框
                    outer.$input.val("");
                    outer.add_message(username, text);
                    //将聊天内容发送给其他玩家
                    outer.playground.mps.send_message(username, text);
                }
            }
        });
    }

    //渲染信息
    render_message(message)
    {
        return $(`<div>${message}</div>`);
    }

    //在历史记录中添加信息
    add_message(username, text)
    {
        this.show_history();
        //JavaScript的字符串拼接方式
        let message = `[${username}]${text}`;
        this.$history.append(this.render_message(message));
        //每次使历史记录滚动至最底部
        this.$history.scrollTop(this.$history[0].scrollHeight);
    }

    //展示历史记录
    show_history()
    {
        let outer = this;
        //历史记录是渐入式
        this.$history.fadeIn();

        if (this.func_id)
            clearTimeout(this.func_id);

        //三秒钟后自动关闭
        this.func_id = setTimeout(function(){
            outer.$history.fadeOut();
            outer.func_id = null;
        }, 3000);
    }



    //显示输入框
    show_input()
    {
        this.show_history();
        this.$input.show();
        //聚焦之后才能输入内容
        this.$input.focus();
    }

    //关闭输入框
    hide_input()
    {
        this.$input.hide();
        //隐藏后要将重新聚焦至地图上
        this.playground.game_map.$canvas.focus();
    }
}
