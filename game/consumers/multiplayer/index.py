from channels.generic.websocket import AsyncWebsocketConsumer
import json
#引入settings，用于获取房间最大人数
from django.conf import settings
#引入cache，用于Redis
from django.core.cache import cache

class MultiPlayer(AsyncWebsocketConsumer):
    #前端访问链接的时候，会创建连接
    async def connect(self):

        await self.accept()


    #前端断开的时候，执行断开操作
    #不是很完善的方式
    async def disconnect(self, close_code):
        print('disconnect')
        await self.channel_layer.group_discard(self.room_name, self.channel_name);


    #添加玩家（自己）
    async def create_player(self, data):

        self.room_name = None

        #调试专用
        start = 0
        if data['username'] != "admin":
            start = 1000

        #枚举有几个房间
        for i in range(start,10000):
            name = "room-%d" % (i)
            #如果没有这个房间或者房间人数不足，就采用这个房间
            if not cache.has_key(name) or len(cache.get(name)) < settings.ROOM_CAPACITY:
                self.room_name = name
                break

        #如果没有房间名称返回
        if not self.room_name:
            return




        #如果没有房间则创建房间，有效期1小时
        if not cache.has_key(self.room_name):
            cache.set(self.room_name, [], 3600)

        #将房间内其他所有玩家信息发送给自己
        #dumps()将字典转化为字符串
        for player in cache.get(self.room_name):
            await self.send(text_data=json.dumps({
                'event': "create_player",
                'uuid': player['uuid'],
                'username': player['username'],
                'photo': player['photo'],
                }))

        #将连接加入到组中，用于组内群发
        await self.channel_layer.group_add(self.room_name, self.channel_name)


        #通过房间号获取自己房间所有玩家信息
        #将自己信息添加进Redis中
        players = cache.get(self.room_name)
        players.append({
            'uuid': data['uuid'],
            'username': data['username'],
            'photo': data['photo']
        })
        #潜在逻辑：最后一名玩家创建完成后，房间保持2小时
        cache.set(self.room_name, players, 3600)

        #群发被添加玩家的信息
        #type表示群发接收的函数
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': "group_send_event",
                'event': "create_player",
                'uuid': data['uuid'],
                'username': data['username'],
                'photo': data['photo']
            }
        )


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

    #处理群发消息的函数'type': "group_send_event",
    async def group_send_event(self, data):
        await self.send(text_data=json.dumps(data))

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


    #前端发送的请求会由该函数处理
    async def receive(self, text_data):
        data = json.loads(text_data)
        #获取事件类型
        event = data['event']

        if event == "create_player":
            await self.create_player(data)
        elif event == "move_to":
            await self.move_to(data)
        elif event =="shoot_fireball":
            await self.shoot_fireball(data);
