from django.http import JsonResponse
from django.contrib.auth import logout

def signout(request):
    user = request.user

    #如果不是登录状态直接返回成功
    if not user.is_authenticated:
        return JsonResponse({
            'result': "success",
        })

    #把注册的cookie删掉
    logout(request)

    return JsonResponse({
        'result': "success",
    })
