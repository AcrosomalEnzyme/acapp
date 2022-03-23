from django.http import JsonResponse
#验证用户登录
from django.contrib.auth import authenticate, login


def signin(request):
    #获取传输过来的用户名和密码
    data = request.GET
    username = data.get('username')
    password = data.get('password')

    #判断并赋予user是否可以登录
    user = authenticate(username=username, password=password)

    #用户名或密码不正确，返回错误信息
    if not user:
        return JsonResponse({
            'result':"用户名或密码不正确"
        })
    #成功即登录
    login(request, user)
    return JsonResponse({
        'result':"success"
    })
