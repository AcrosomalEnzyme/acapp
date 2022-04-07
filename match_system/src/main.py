#! /usr/bin/env python3

import glob
import sys
sys.path.insert(0, glob.glob('../../')[0])

#引入Match.py
from match_server.match_service import Match

from thrift.transport import TSocket
from thrift.transport import TTransport
from thrift.protocol import TBinaryProtocol
from thrift.server import TServer

#引入队列用于消息队列
from queue import Queue
#引入sleep，使一秒钟匹配一次
from time import sleep
#线程
from threading import Thread


#引入channel_layer
from acapp.asgi import channel_layer
#引入使并行变为串行
from asgiref.sync import async_to_sync
#引入Redis存储匹配结果
from django.core.cache import cache


#创建全局消息队列
queue = Queue()


#玩家类，定义玩家的基础信息
class Player:
    #构造函数
    def __init__(self, score, uuid, username, photo, channel_name):
        self.score = score
        self.uuid = uuid
        self.username = username
        self.photo = photo
        self.channel_name = channel_name
        #等待时间
        self.waiting_time = 0



#匹配池类
class Pool:

    def  __init__(self):
        self.players = []


    #匹配池中添加玩家
    def add_player(self, player):
        print("Add Player: %s %d" % (player.username, player.score))
        self.players.append(player)


    #检验两个玩家是否匹配
    def check_match(self, a, b):
        #确保不会匹配同一个玩家
        #if a.username == b.username:
        #    return False
        #两个玩家分差
        dt = abs(a.score - b.score)
        #玩家的可以接受的匹配分差为等待时间的50倍
        a_max_dif = a.waiting_time * 50
        b_max_dif = b.waiting_time * 50
        return dt <= a_max_dif and dt <= b_max_dif


    #当匹配成功时，传入一个玩家数组
    def match_success(self, ps):
        print("match success: %s %s %s" % (ps[0].username, ps[1].username, ps[2].username))
        #方便Redis通过用户查找房间
        room_name = "room-%s-%s-%s" % (ps[0].uuid, ps[1].uuid, ps[2].uuid)
        players = []
        #将玩家添加进广播组
        for p in ps:
            async_to_sync(channel_layer.group_add)(room_name, p.channel_name)
            players.append({
                'uuid': p.uuid,
                'username': p.username,
                'photo': p.photo,
                'hp': 100,
            })
        #创建房间，有效期1小时
        cache.set(room_name, players, 3600)
        #广播
        for p in ps:
            async_to_sync(channel_layer.group_send)(
                room_name,
                {
                    'type': "group_send_event",
                    'event': "create_player",
                    'uuid': p.uuid,
                    'username': p.username,
                    'photo': p.photo,
                }
            )


    #增加匹配池中所有玩家已经匹配的时间
    def increase_waiting_time(self):
        for player in self.players:
            player.waiting_time += 1

    #匹配，采用贪心原则
    def match(self):
        #当玩家数量大于3时开始匹配
        while len(self.players) >= 3:
            #按照分数排序
            self.players = sorted(self.players, key=lambda p: p.score)
            flag = False
            #取三名玩家进行匹配
            for i in range(len(self.players) - 2):
                a, b, c = self.players[i], self.players[i + 1], self.players[i + 2]
                if self.check_match(a, b) and self.check_match(b, c) and self.check_match(a, c):
                    self.match_success([a, b, c])
                    #从匹配池移出匹配成功的玩家
                    self.players = self.players[:i] + self.players[i + 3:]
                    flag = True
                    break
            #当前所有玩家都无法匹配成功
            if not flag:
                break

        self.increase_waiting_time()




class MatchHandler:
    def add_player(self, score, uuid, username, photo, channel_name):
        #创建玩家
        player = Player(score, uuid, username, photo, channel_name)
        #将玩家添加到消息队列
        queue.put(player)
        return 0

#从队列当中获取元素
def get_player_from_queue():
    #如果队列为空，会返回异常，执行报错
    try:
        return queue.get_nowait()
    except:
        return None

#执行匹配的函数
def worker():
    #创建匹配池
    pool = Pool()

    #死循环，执行匹配操作
    while True:

        #从队列中获取玩家
        player = get_player_from_queue()

        #如果玩家存在,将玩家加入匹配池
        #玩家不存在，执行匹配池匹配，并阻塞1秒
        if player:
            pool.add_player(player)
        else:
            pool.match()
            sleep(1)

if __name__ == '__main__':
    handler = MatchHandler()
    processor = Match.Processor(handler)
    transport = TSocket.TServerSocket(host='127.0.0.1', port=9090)
    tfactory = TTransport.TBufferedTransportFactory()
    pfactory = TBinaryProtocol.TBinaryProtocolFactory()

    # 第一种选择：单线程
    #server = TServer.TSimpleServer(processor, transport, tfactory, pfactory)

    # You could do one of these for a multithreaded server
    # 第二种选择：每来一个请求开一个线程，并行度最高
    server = TServer.TThreadedServer(
        processor, transport, tfactory, pfactory)
    # 第三种选择：预开n个线程，超过限制阻塞
    # server = TServer.TThreadPoolServer(
    #     processor, transport, tfactory, pfactory)

    #定义新的线程，执行函数为worker
    #执行函数worker，守护线程为True，表示主线程关闭时一同被关闭，False反之
    Thread(target=worker, daemon=True).start()

    print('Starting the server...')
    server.serve()
    print('done.')
