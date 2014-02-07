#! /usr/bin/env node


// 从 /etc/ydkme 读取配置文件
var config={} ;
var configfile = "/etc/ydkme.config.json" ;
try{
    config = require(configfile) ;
    console.log("载入配置文件",configfile) ;
}catch(err){
    if(err.code=='MODULE_NOT_FOUND')
	console.log("没有发现配置文件",configfile) ;
    else {
	console.log('载入配置文件',configfile,'时遇到了错误：') ;	
	console.log(err.stack) ;
    }
}
var configTemplate = config.__proto__ = {
    port: 25
/*
    , forwards: [
	{
	    match: <regexp>
	    , to: ["<email>","<email>"]
	}
    ]
*/
    , db: {
	url: "mongodb://localhost:27017/ydkme"
    }
} ;


require("../index").createServer(config.port)

    // 设置中间件
    .use(require('../middlewares/savedb.js')(config.db.url))
    .use(require('../middlewares/cmd-expire.js'))
    .use(require('../middlewares/forward.js')(config.forwards||[],config.forwarder))

    // 启动
    .listen( config.port||25, function(err){
	if(err) {
	    if(err.code=='EACCES')
		console.log('无权限监听'+config.port+'端口，请以root身份运行，或以sudo运行') ;
	    else
		console.log(err) ;
	}
	else{
	    console.log("ydkme 已经在端口"+config.port+"上启动") ;
	}
    }) ;


