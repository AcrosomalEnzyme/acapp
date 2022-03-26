#如果新建了文件夹，就要添加include
from django.urls import path, include
#引入获取用户信息的view中的获取登录信息函数
from game.views.settings.getinfo import getinfo
#引入登录的view中的登录函数
from game.views.settings.login import signin
#引入登出的view中的登出函数
from game.views.settings.logout import signout
#引入登出的view中的注册函数
from game.views.settings.register import register

urlpatterns = [
    #路径，一般和名字相同，路由给的函数，名字随意
    path("getinfo/", getinfo, name="settings_getinfo"),
    path("login/", signin, name="settings_login"),
    path("logout/", signout, name="settings_logout"),
    path("register/", register, name="settings_register"),
    path("acwing/", include("game.urls.settings.acwing.index")),
]
