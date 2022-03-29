from django.urls import path
#引入多人对战的consumer
from game.consumers.multiplayer.index import MultiPlayer

websocket_urlpatterns = [
        path("wss/multiplayer/", MultiPlayer.as_asgi(), name="wss_multiplayer"),
]
