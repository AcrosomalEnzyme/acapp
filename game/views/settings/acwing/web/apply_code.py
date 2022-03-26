#给前端返回一个封装好的链接，前端再重新访问acwing
from django.http import JsonResponse
#将url中的特殊字符替换为非特殊字符
from urllib.parse import quote
#用于生成随机数
from random import randint
#用于储存state
from django.core.cache import cache

#生成state随机数
def get_state():
    res = ""
    for i in range(8):
        res += str(randint(0, 9))
    return res


def apply_code(request):
    
    #acwing中的APPID
    appid = "1881"
    
    #将重定向地址中的特殊字符替换为非特殊字符
    redirect_uri = quote("https://app1881.acapp.acwing.com.cn/settings/acwing/web/receive_code/")
    
    #获取信息范围
    scope = "userinfo"

    #获取状态码并存入cache，有效期两小时
    state = get_state()
    cache.set(state, True, 7200)

    #请求的地址
    apply_code_url = "https://www.acwing.com/third_party/api/oauth2/web/authorize/"

    return JsonResponse({
        'result': "success",
        'apply_code_url': apply_code_url + "?appid=%s&redirect_uri=%s&scope=%s&state=%s" % (appid, redirect_uri, scope, state)
    })
