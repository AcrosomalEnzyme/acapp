from django.http import JsonResponse
#重定向到相应页面
from django.shortcuts import redirect
#用于判定与Redis的state是否正确
from django.core.cache import cache
#申请授权令牌，发起请求
import requests
#引入用户，判断用户信息是否已经存在
from django.contrib.auth.models import User
from game.models.player.player import Player
#引入随机数，防止重名
from random import randint


def receive_code(request):
    data = request.GET
    
    #如果授权失败
    if "errcode" in data:
        return JsonResponse({
            'result': "apply_failed",
            'errcode': data['errcode'],
            'errmsg': data['errmsg'],
        })

    #授权码和state
    code = data.get('code')
    state = data.get('state')

    #证明不是自己服务器发送的请求
    if not cache.has_key(state):
        return Jsonresponse({
            'result': "state not exists"
        })

    cache.delete(state)

    #申请授权令牌的url和参数
    apply_access_token_url = "https://www.acwing.com/third_party/api/oauth2/access_token/?appid=APPID&secret=APPSECRET&code=CODE"
    params = {
        'appid':"1881",
        'secret': "33e2d623d55940168c4ed752d276d23c",
        'code': code
    }
    #发起并获取申请授权令牌
    access_token_res = requests.get(apply_access_token_url, params=params).json()
    access_token = access_token_res['access_token']
    openid = access_token_res['openid']

    #如果用户已经有了openid，
    players = Player.objects.filter(openid=openid)
    if players.exists():
        player = players[0]
        return JsonResponse({
            'result': "success",
            'username': player.user.username,
            'photo': player.photo,
        })

    #如果用户不存在，访问链接获取用户信息
    get_userinfo_url = "https://www.acwing.com/third_party/api/meta/identity/getinfo/"
    params = {
        "access_token": access_token,
        "openid": openid
    }
    userinfo_res = requests.get(get_userinfo_url, params=params).json()
    username = userinfo_res['username']
    photo = userinfo_res["photo"]

    #获取到用户信息，用acwing用户信息进行注册并登录
    #如果重名，添加一位随机数
    while User.objects.filter(username=username).exists():
        username += str(randint(0, 9))

    user = User.objects.create(username=username)
    player = Player.objects.create(user=user, photo=photo, openid=openid)


    #重定向根目录域名
    return JsonResponse({
        'result': "success",
        'username': player.user.username,
        'photo': player.photo,
    })

