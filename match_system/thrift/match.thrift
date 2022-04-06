/*表示使用py编写，命名为match_service*/
namespace py match_service

/*添加匹配的服务*/
service Match
{
    /*编写添加用户函数*/
    /*传入一个int的分数，string的UUID，string的用户名，string的头像*/
    /*string的channel的名字，通过Django的API，在其他进程外通知channel*/
    i32 add_player(1: i32 score, 2: string uuid, 3: string username, 4: string photo, 5: string channel_name),
}
