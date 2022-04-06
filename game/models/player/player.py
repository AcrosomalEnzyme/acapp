#创建数据库表必须要引入的类
from django.db import models
from django.contrib.auth.models import User

#创建player类，需要引入models的Model类
class Player(models.Model):

    #player这个表是从user扩充过来的，user与User的表一一对应，user删除的时候，和其关联的player一样会被删除掉
    user = models.OneToOneField(User, on_delete = models.CASCADE)

    #头像是一个链接，最大长度256，可以为空
    photo = models.URLField(max_length = 256, blank = True)

    #增加openID，是32位字符串
    openid = models.CharField(default="", max_length=50, blank=True, null=True)

    #分数
    score = models.IntegerField(default = 1500)

    #展示用户的名字
    def __str__(self):
        return str(self.user)
