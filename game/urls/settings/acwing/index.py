from django.urls import path
#引入申请授权码的函数
from game.views.settings.acwing.web.apply_code import apply_code
#引入收到授权码的函数
from game.views.settings.acwing.web.receive_code import receive_code

urlpatterns = [
    path("web/apply_code/", apply_code, name="settings_acwing_web_apply_code"),
    path("web/receive_code/", receive_code, name="settings_acwing_web_receive_code"),]
