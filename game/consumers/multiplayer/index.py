from channels.generic.websocket import AsyncWebsocketConsumer
import json
#引入settings，用于获取房间最大人数
from django.conf import settings
#引入cache，用于Redis
from django.core.cache import cache

class MultiPlayer(AsyncWebsocketConsumer):
    #前端访问链接的时候，会创建连接
    async def connect(self):

        self.room_name = None

        #枚举有几个房间
        for i in range(1000):
            name = "room-%d" % (i)
            #如果没有这个房间或者房间人数不足，就采用这个房间
            if not cache.has_key(name) or len(cache.get(name)) < settings.ROOM_CAPACITY:
                self.room_name = name
                break

        #如果没有房间名称返回
        if not self.room_name:
            return


        await self.accept()


        #如果没有房间则创建房间，有效期1小时
        if not cache.has_key(self.room_name):
            cache.set(self.room_name, [], 3600)

        #向所有房间内玩家发送信息
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




    #前端断开的时候，执行断开操作
    #不是很完善的方式
    async def disconnect(self, close_code):
        print('disconnect')
        await self.channel_layer.group_discard(self.room_name, self.channel_name);


    #往房间添加玩家
    async def create_player(self, data):
        players = cache.get(self.room_name)
        players.append({
            'uuid': data['uuid'],
            'username': data['username'],
            'photo': data['photo']
        })
        #最后一名玩家创建完成后，房间保持2小时
        cache.set(self.room_name, players, 3600)

        #print("my test")
        #群发消息
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': "group_create_player",
                'event': "create_player",
                'uuid': data['uuid'],
                'username': data['username'],
                'photo': data['photo']
            }
        )

    #处理create_player群发消息的函数'type': "group_create_player",
    async def group_create_player(self, data):
        #发送给前端
        print()
        print("send_data")
        print()
        await self.send(text_data=json.dumps(data))


    #前端发送的请求会由该函数处理
    async def receive(self, text_data):
        data = json.loads(text_data)
        print(data)
        #获取事件类型
        event = data['event']

        if event == "create_player":
            await self.create_player(data)
