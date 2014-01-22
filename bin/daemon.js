var config, configTemplate = {
    port: 25
    , forwards: []
    , db: {
	server: 'localhost'
	, name: 'ydkme'
	, user: undefined
	, password: undefined
    }
}

try{
    config = require("/etc/ydkme.conf") ;
}catch(err){
    config = {}
}
config = configTemplate ;


require("../index").createServer(config.port)
    .use(function(conn){
	conn.to[0] ;
    })
    .listen(config.port||25) ;



