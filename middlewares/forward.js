var dns = require("dns") ;
var simplesmtp = require("simplesmtp") ;

module.exports = function(forwardList){


    return function(req,next){
console.log(req.to[0]) ;
	for(var i=0;i<forwardList.length;i++){
	    var metafw = forwardList[i] ;
console.log(metafw) ;
	    if( metafw.match && req.to[0].toString().toLowerCase().match(metafw.match) ) {
		for(var l=0;l<metafw.to.length;l++){
		    var to = metafw.to[l] ;
		    resolveEmailServer(to,function(err,host){
			if(err) 
			    console.log(err) ;
			if(host)
			    forward(host,to,req) ;
		    }) ;
		}
		break ;
	    }
	}

	next() ;
    }
}

function resolveEmailServer(email,cb){
    var server = email.split('@').slice(1).join('@') ;
    dns.resolveMx(server,function(err,records){
	if(err) return cb && cb(err) ;
	cb && cb( null, records && records[0] && records[0].exchange ) ;
    }) ;
}

// forward
function forward(host,to,req){
console.log(host,to,req.from) ;
    var client = simplesmtp.connect(25,host,{});
    client.once("idle", function(){
	console.log("idle") ;
	client.useEnvelope({
            from: req.from,
            to: [to]
	});
    });

    client.on("message", function(){
	console.log("message") ;
	for(var i=0;i<req.chunks.length;i++){
	    client.write(req.chunks[i]) ;
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


