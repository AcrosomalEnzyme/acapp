from django.http import HttpResponse

def index(request):
    return HttpResponse("index")


def play(request):
    line1 = '<a href = "/">返回主界面</a>'
    line2 = '<h1>Game Page</h1>'
    return HttpResponse(line1 + line2)
# Create your views here.
