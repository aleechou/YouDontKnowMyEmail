var simplesmtp = require("simplesmtp");
var dns = require("dns") ;
var MailParser = require("mailparser").MailParser ;


exports.createServer = function(port){

    var middlewares = [] ;

    var server = simplesmtp.createSimpleServer({SMTPBanner:'YouDontKownMyEmail'},function(req){

	console.log("mail comein.") ;
	
	req.mailparser = new MailParser ;
	req.on("data", function(chunk){
	    req.mailparser.write(chunk) ;
	});	
	req.on("end", function(){
	    req.mailparser.end() ;
	}) ;

	    
	req.mailparser.on("end",function(mail){
	    req.mail = mail ;

	    console.log("------") ;
	    console.log(req.mail) ;

	    // 执行中间件
	    var ms = middlewares.slice() ;
	    function next(){
		process.nextTick(function(){

		    if( req.rejected )
			return ;

		    var mw = ms.shift() ;

		    // all middlewares has over
		    if(!mw) {
			if(!req.rejected)
			    req.accept() ;
			return ;
		    }

		    // match to address
		    if( mw.match && !(req.to[0]||'').match(mw.match) )
			return process.nextTick(next) ;

		    // run middleware
		    mw.middleware(
			req.mail
			, next
			, function(){
			    req.reject() ;
			}
		    ) ;

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
