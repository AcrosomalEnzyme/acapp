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
                //console.log(res);
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
                //console.log(res);
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

        //console.log(password);
        //console.log(password_confirm);

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
        if (this.platform === "ACAPP")
        {
            this.root.AcWingOS.api.window.close();
        }
        else
        {
            $.ajax({
                url: "https://app1881.acapp.acwing.com.cn/settings/logout/",
                type: "GET",
                success: function(res){
                    //console.log(res);
                    if (res.result === "success")
                    {
                        location.reload();
                    }
                }
            });
        }
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
            //console.log(res);
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
                //console.log(res);
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
