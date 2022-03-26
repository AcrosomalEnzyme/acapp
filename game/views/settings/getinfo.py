#必须要加的头文件
from django.http import JsonResponse
#添加数据库表
from game.models.player.player import Player


#处理ACAPP端发来的请求
def getinfo_acapp(request):
    #获取第一个玩家
    player = Player.objects.all()[0]
    return JsonResponse({
        'result' : "success",
        'username' : player.user.username,
        'photo' : player.photo,
        })


    #处理web端发来的请求
def getinfo_web(request):

    #获取到发送请求的用户
    user = request.user

    #利用内置函数判断用户是否登录
    if not user.is_authenticated:
        return JsonResponse({
            'result' : "未登录"
            })
    else:
        #查找当前用户的信息
        player = Player.objects.get(user=user)
        return JsonResponse({
            'result' : "success",
            'username' : player.user.username,
            'photo' : player.photo,
        })



    #处理请求的都要加request
def getinfo(request):
    #判断是从哪个平台发过来的
    platform = request.GET.get('platform')
    if platform == "ACAPP":
        return getinfo_acapp(request)
    elif platform == "WEB":
        return getinfo_web(request)
