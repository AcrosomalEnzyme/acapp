class AcGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`<div>游戏界面</div>`);
        //加入到父对象之前要关掉，用hide
        this.hide();
        this.root.$ac_game.append(this.$playground);

        this.start();

    }

    start() {
        
    }

    update() {
    
    }

    show() {
        this.$playground.show();
    }

    hide() {
        this.$playground.hide();
    }

}
