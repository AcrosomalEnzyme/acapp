from django.http import JsonResponse
from django.contrib.auth import login
from django.contrib.auth.models import User
from game.models.player.player import Player

def register(request):
    data = request.GET
    #获取前端传入的用户名，默认为空。strip可以去除字符串前后空格
    username = data.get("username", "")
    password =data.get("password", "").strip()
    password_confirm = data.get("password_confirm", "").strip()

    #如果用户名或者密码是空的，返回错误
    if not username or not password:
        return JsonResponse({
            'result': "用户名和密码不能为空"
        })

    #如果两次密码不一致，返回错误
    if password != password_confirm:
        return JsonResponse({
            'result': "两次密码不一致"
        })

    #如果用户名存在
    if User.objects.filter(username=username).exists():
        return JsonResponse({
            'result': "用户名已存在"
        })

    #条件都满足，可以在user表创建用户
    #存入用户名字和密码，密码存的是哈希值
    user = User(username=username)
    user.set_password(password)
    user.save()

    #在player表创建用户
    Player.objects.create(user=user, photo="https://app1881.acapp.acwing.com.cn/static/image/test.jpg")
    #创建完直接登录
    login(request, user)
    #返回成功信息
    return JsonResponse({
        'result': "success",
    })
