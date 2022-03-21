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
