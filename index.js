var simplesmtp = require("simplesmtp");
var dns = require("dns") ;


exports.createServer = function(port){

    var middlewares = [] ;

    var server = simplesmtp.createSimpleServer({SMTPBanner:'YouDontKownMyEmail'},function(req){

	console.log("mail comein.") ;
	
	req.chunks = [] ;
	req.on("data", function(chunk){
	    req.chunks.push(chunk) ;
	});

	
	req.on("end", function(){

	    // 合并buffer chunks
	    req.contents = "" ;
	    for(var i=0;i<req.chunks.length;i++)
		req.contents+= req.chunks[i].toString() ;

	    // 执行中间件
	    var ms = middlewares.slice() ;
	    function next(){
		process.nextTick(function(){

		    if( req.rejected ){
			return ;
		    }

		    var mw = ms.shift() ;

		    // all middlewares has over
		    if(!mw) {
			if(!req.rejected){
			    req.accept() ;
			}
			return ;
		    }

		    // match to address
		    if( mw.match && !(req.to[0]||'').match(mw.match) )
			return process.nextTick(next) ;

		    // run middleware
		    process.nextTick(function(){
			mw.middleware(req,next) ;
		    }) ;

		}) ;
	    } ;
	    next() ;
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
    } ;

    return server ;
}
