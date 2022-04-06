from channels.generic.websocket import AsyncWebsocketConsumer
import json
#引入settings，用于获取房间最大人数
from django.conf import settings
#引入cache，用于Redis
from django.core.cache import cache

#引入thrift头文件，用于匹配系统
from thrift import Thrift
from thrift.transport import TSocket
from thrift.transport import TTransport
from thrift.protocol import TBinaryProtocol

#引入match，用于匹配系统
from match_system.src.match_server.match_service import Match
#引入数据库，并使同步操作转化为异步
from game.models.player.player import Player
from channels.db import database_sync_to_async

class MultiPlayer(AsyncWebsocketConsumer):
    #前端访问链接的时候，会创建连接
    async def connect(self):

        await self.accept()


    #前端断开的时候，执行断开操作
    #不是很完善的方式
    async def disconnect(self, close_code):
        print('disconnect')
        if self.room_name:
            await self.channel_layer.group_discard(self.room_name, self.channel_name);


    #添加玩家（自己）
    async def create_player(self, data):

        self.room_name = None
        self.uuid = data['uuid']

        #创建socket连接
        transport = TSocket.TSocket('127.0.0.1', 9090)
        # Buffering is critical. Raw sockets are very slow
        transport = TTransport.TBufferedTransport(transport)

        # Wrap in a protocol
        protocol = TBinaryProtocol.TBinaryProtocol(transport)

        # Create a client to use the protocol encoder
        client = Match.Client(protocol)

        #获取用户名，注意两个下划线
        def db_get_player():
            return Player.objects.get(user__username=data['username'])

        #变成了异步函数，要await，注意括号加在后面
        player = await database_sync_to_async(db_get_player)()

        # Connect!
        transport.open()

        client.add_player(player.score, data['uuid'], data['username'], data['photo'], self.channel_name)

        # Close!
        transport.close()


    #处理群发消息的函数'type': "group_send_event",
    async def group_send_event(self, data):
        #如果没有房间名，获取到房间名
        if not self.room_name:
            keys = cache.keys('*%s*' % (self.uuid))
            if keys:
                self.room_name = keys[0]
        await self.send(text_data=json.dumps(data))

    #群发玩家（自己）移动的目的地
    async def move_to(self, data):
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': "group_send_event",
                'event': "move_to",
                'uuid': data['uuid'],
                'tx': data['tx'],
                'ty': data['ty'],
            }
        )


    #群发火球的消息
    async def shoot_fireball(self, data):
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': "group_send_event",
                'event': "shoot_fireball",
                'uuid': data['uuid'],
                'tx': data['tx'],
                'ty': data['ty'],
                'ball_uuid': data['ball_uuid'],
            }
        )

    #群发给对手玩家造成了伤害的消息
    async def attack(self, data):

        if not self.room_name:
            return

        #获取所有玩家信息，用于结局判定分数
        players = cache.get(self.room_name)

        #处理同时“最后一发”的特殊情况
        if not players:
            return

        #如果是被攻击者，扣25血量
        for player in players:
            if player['uuid'] == data['attackee_uuid']:
                player['hp'] -= 25

        #统计当前剩余玩家数量
        remain_cnt =  0
        for player in players:
            if player['hp'] > 0:
                remain_cnt += 1

        #如果玩家人数>1，更新人数，否则游戏结束
        if remain_cnt > 1 and self.room_name:
            cache.set(self.room_name, players, 3600)

        else:
            #定义更新数据库玩家分数并保存结果的函数
            def db_update_player_score(username, score):
                player = Player.objects.get(user__username=username)
                player.score += score
                player.save()

            #玩家如果死亡扣5分，如果玩家是幸存者，加10分
            for player in players:
                if player['hp'] <= 0:
                    await database_sync_to_async(db_update_player_score)(player['username'], -5)
                else:
                    await database_sync_to_async(db_update_player_score)(player['username'], 10)


        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': "group_send_event",
                'event': "attack",
                'uuid': data['uuid'],
                'attackee_uuid': data['attackee_uuid'],
                'x': data['x'],
                'y': data['y'],
                'angle': data['angle'],
                'damage':data['damage'],
                'ball_uuid': data['ball_uuid'],
            }
        )


    #群发给对手闪现的位置
    async def blink(self, data):
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': "group_send_event",
                'event': "blink",
                'uuid': data['uuid'],
                'tx': data['tx'],
                'ty': data['ty'],
            }
        )

    #群发聊天信息
    async def message(self, data):
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': "group_send_event",
                'event': "message",
                'uuid': data['uuid'],
                'text': data['text'],
                'username': data['username'],
            }
        )


    #前端发送的请求会由该函数处理
    async def receive(self, text_data):
        data = json.loads(text_data)
        #获取事件类型
        event = data['event']

        if event == "create_player":
            await self.create_player(data)
        elif event == "move_to":
            await self.move_to(data)
        elif event == "shoot_fireball":
            await self.shoot_fireball(data)
        elif event == "attack":
            await self.attack(data)
        elif event == "blink":
            await self.blink(data)
        elif event == "message":
            await self.message(data)
