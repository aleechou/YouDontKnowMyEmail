
var utils = {
    s: 1000
    , h: 1000*60*60
    , d: 1000*60*60*24
    , w: 1000*60*60*24*7
    , m: 1000*60*60*24*30
}
var regexp = new RegExp("\\-(\\d+)("+Object.keys(utils).join('|')+")","i") ;

module.exports = function(mail,next,reject) {

    if(!mail.todoc) {
	console.log("middleware cmd-expire.js 依赖 savedb.js") ;
	return next () ;
    }

    var name = mail.to[0].address.split('@')[0] ;

    var res = regexp.exec(name) ;
    if(!res){
	return next() ;
    }

    var expire = utils[ res[2] ] * res[1] ;
    if( Date.now()-mail.todoc.createTime > expire ){
	console.log(
	    "["+(new Date).toISOString().replace('T',' ')+"]"
	    , "过期的email地址:", mail.to[0].address
	    , "创建时间:", (new Date(mail.todoc.createTime)).toISOString().replace('T',' ')
	) ;
	return reject() ;
    }

    next() ;
}
