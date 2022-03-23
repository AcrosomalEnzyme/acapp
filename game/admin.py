from django.contrib import admin
#引入编写的表
from game.models.player.player import Player


# Register your models here.

#注册编写的Player类
admin.site.register(Player)
