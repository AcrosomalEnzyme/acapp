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
                return false;

            let event = data.event;
            //如果接收到创建player
            if(event === "create_player")
            {
                outer.receive_create_player(uuid, data.username, data.photo);
            }
            //如果接收到移动位置
            else if (event === "move_to")
            {
                outer.receive_move_to(uuid, data.tx, data.ty);
            }
            //如果接收到发射火球
            else if (event === "shoot_fireball")
            {
                //console.log("receive", outer.uuid, data.uuid);
                outer.receive_shoot_fireball(uuid, data.tx, data.ty, data.ball_uuid);
            }
            else if (event === "attack")
            {
                outer.receive_attack(uuid, data.attackee_uuid, data.x, data.y, data.angle, data.damage, data.ball_uuid);
            }
            else if (event === "blink")
            {
                outer.receive_blink(uuid, data.tx, data.ty);
            }
            else if (event === "message")
            {
                outer.receive_message(uuid, data.username, data.text);
            }
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
            "white",
            0.15,
            "enemy",
            username,
            photo
        )

        player.uuid = uuid;
        this.playground.players.push(player);
        //console.log(this.playground.players.length);
    }

    //根据UUID找到对应的玩家
    get_player(uuid)
    {
        let players = this.playground.players;
        for (let i = 0; i < players.length; i ++)
        {
            let player = players[i];
            if (player.uuid === uuid)
            {
                return player;
            }
        }

        return null;
    }

    //广播发送移动的目的地坐标信息
    send_move_to(tx, ty)
    {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "move_to",
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty,
        }));
    }

    //接收广播发送移动的目的地坐标信息
    receive_move_to(uuid, tx, ty)
    {
        //找到对应的玩家
        let player = this.get_player(uuid);
        //玩家存在，将其移动到目的地
        if(player)
        {
            player.move_to(tx, ty);
        }
    }

    //发送发射火球的信息
    send_shoot_fireball(tx, ty, ball_uuid)
    {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "shoot_fireball",
            //本窗口玩家的UUID，用于判定击中
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty,
            'ball_uuid': ball_uuid,
        }));
    }

    //接收其他玩家发射火球的消息
    receive_shoot_fireball(uuid, tx, ty, ball_uuid)
    {
        //console.log(uuid,tx,ty);
        let player = this.get_player(uuid);
        if (player)
        {
            //记录传下来的火球和对应的UUID
            let fireball = player.shoot_fireball(tx, ty);
            fireball.uuid = ball_uuid;
        }
    }

    //删除火球
    destroy_fireball(uuid)
    {
        for (let i = 0; i < this.fireballs.length; i ++)
        {
            let fireball = this.fireball[i];
            if (fireball.uuid === uuid)
            {
                fireball.destroy();
                break;
            }
        }
    }    send_attack(attackee_uuid, x, y, angle, damage, ball_uuid) {
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


    //传递造成伤害的信息，为了减少多次计算的误差，需要传递受攻击者的坐标，各个窗口进行同步
    //传递被击中角度，用于计算击退效果
    //传递伤害值和炮弹UUID，用于击中后删除火球
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

    //接收被攻击的信息
    //攻击者的UUID，被攻击者的UUID
    receive_attack(uuid, attackee_uuid, x, y, angle, damage, ball_uuid) {
        let attacker = this.get_player(uuid);
        let attackee = this.get_player(attackee_uuid);

        if (attacker && attackee) {
            attackee.receive_attack(x, y, angle, damage, ball_uuid, attacker);
        }
    }


    //传递闪现的位置信息
    send_blink(tx, ty) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "blink",
            'uuid': outer.uuid,
            'tx': tx,
            'ty': ty,
        }));
    }

    //接收闪现的位置信息
    receive_blink(uuid, tx, ty) {
        let player = this.get_player(uuid);
        if (player) {
            player.blink(tx, ty);
            player.move_length = 0;
        }
    }

    //传递聊天信息
    send_message(username, text) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "message",
            'uuid': outer.uuid,
            'username': username,
            'text': text,
        }));
    }

    //接收聊天信息
    receive_message(uuid, username, text) {
        this.playground.chat_field.add_message(username, text);
    }


}



