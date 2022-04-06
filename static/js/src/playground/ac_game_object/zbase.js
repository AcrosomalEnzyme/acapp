let AC_GAME_OBJECTS = [];

class AcGameObject {
    constructor() {
        AC_GAME_OBJECTS.push(this);

        this.has_called_start = false; //是否执行过start函数
        this.timedelta = 0; //当前帧距离上一帧的时间间隔，不同浏览器不一定每秒钟调用 requestAnimationFrame(AC_GAME_ANIMATION); 60次数。为了方便统一速度
        this.uuid = this.create_uuid();//创建唯一编号
    }

    //创建唯一编号，用于联机使用
    //使用随机的八位数
    create_uuid()
    {
        let res = "";
        for ( let i = 0; i < 8; i ++)
        {
            //返回[0,1)之间的数
            let num = parseInt(Math.floor(Math.random() * 10));
            res += num;
        }
        return res;
    }

    //只会在第一帧执行一次
    start() {
    }

    //每一帧都会执行一次
    update() {
    }

    //在每一帧最后执行一次
    late_update()
    {
        
    }

    //在被销毁前执行一次
    on_destroy() {
    }

    //删掉该物体，JavaScript中，一个对象没有被任何变量存下来便会自动被释放掉
    destroy() {
        //console.log("destroy");
        this.on_destroy();
        for (let i = 0; i < AC_GAME_OBJECTS.length; i ++)
        {
            //JavaScript中用三个等号表示全等
            if(AC_GAME_OBJECTS[i] === this)
            {
                AC_GAME_OBJECTS.splice(i,1);
                break;
            }
        }
        //console.log(AC_GAME_OBJECTS.length);

    }
}




let last_timestamp;
//timestamp时间戳，记录什么时候调用的这个函数
////timeStamp事件属性返回从文档完成加载到创建特定事件的毫秒数。
let AC_GAME_ANIMATION = function(timestamp)
{

    //length不需要加括号
    for(let i = 0; i < AC_GAME_OBJECTS.length; i ++ )
    {
        let obj = AC_GAME_OBJECTS[i];
        //如果没有被执行第一帧
        if (!obj.has_called_start)
        {
            obj.start();
            obj.has_called_start = true;
        }
        else
        {
            //记录两帧之间的时间间隔,last_timestamp不需要初始化，
            //第一次执行的时候，所有物体都是第一帧，第一帧不需要执行timedelta，要执行这一行的时候，timedelta一定是有值的
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }

    for(let i = 0; i < AC_GAME_OBJECTS.length; i ++)
    {
        let obj = AC_GAME_OBJECTS[i];
        obj.late_update();
    }

    //更新时间戳
    last_timestamp = timestamp;
    //利用递归实现每一帧都调用一次这个函数
    requestAnimationFrame(AC_GAME_ANIMATION);

}

//一秒钟调用60次
requestAnimationFrame(AC_GAME_ANIMATION);
