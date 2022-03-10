from django.shortcuts import render

# 引入包用来渲染HTML，render第一个参数肯定是request
def index(request):
    return render(request,"multiends/web.html")
