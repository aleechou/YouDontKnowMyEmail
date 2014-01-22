var simplesmtp = require("simplesmtp");
var dns = require("dns") ;


exports.createServer = function(port){

    var middlewares = [] ;

    var server = simplesmtp.createServer(function(req){

	req.forward = function(){
	}

	conn.chunks = [] ;

	req.on("data", function(conn,chunk){
	    conn.chunks.push(chunk) ;
	});

	req.on("end", function(conn){
	    console.log("dataready") ;

	    var ms = middlewares.slice() ;
	    function next(){
		var mw = ms.shift() ;

		// all middlewares has over
		if(!mw)
		    return ;

		// match to address
		if( mw.match && !(req.to[0]||'').match(mw.match) )
		    return process.nextTick(next) ;

		// run middleware
		process.nextTick(function(){
		    mw.middleware(req,next) ;
		}) ;
	    } ;
	}) ;
    }) ;


    server.use = function(regexp,middleware){
	    if(!middleware && typeof regexp=='function'){
		middlewares.push({
		    middleware: regexp
		}) ;
	    }
	    else {
		middlewares.push({
		    middleware: middleware
		    , regexp: regexp
		}) ;
	    }
	    return this ;
	}
    } ;

    return server ;
}

function resolveEmailServer(email,cb){
    var server = email.split('@').slice(1).join('@') ;
    dns.resolveMx(server,function(err,records){
	if(err) return cb && cb(err) ;
	cb && cb( null, records && records[0] && records[0].exchange ) ;
    }) ;
}


// forward
function forward(chunks){
    var client = simplesmtp.connect(25,'58.250.132.68',{});
    client.once("idle", function(){
	console.log("idle") ;
	client.useEnvelope({
            from: "alee@test.chou.im",
            to: ["alee@chou.im"]
	});
    });

    client.on("message", function(){
	console.log("message") ;
	for(var i=0;i<chunks.length;i++){
	    client.write(chunks[i]) ;
	}
	client.end() ;
    });

    client.on("ready", function(success){
	console.log("ready") ;
	client.close();
    });

    client.on("error", function(err){
	console.log(err) ;
    });

    client.on("end", function(){
	console.log('end') ;
    });

}


