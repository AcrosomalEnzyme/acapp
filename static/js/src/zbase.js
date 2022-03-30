//模块化需要加export
export class AcGame {
    //通过是否有AcwingOS参数判断是否在是ACAPP中调用的
    constructor(id, AcWingOS) {
        //console.log(AcWingOS);
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
