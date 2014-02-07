var mongodb = require('mongodb') ;

module.exports = function(mongourl){

    var dbconn ;
    function db(cb){
	if(!dbconn)
	    mongodb.MongoClient.connect(mongourl,cb) ;
	else
	    cb && cb(null,dbconn) ;
    }
    

    return function (mail,next,reject){
	if(!mail.to[0])
	    return next() ;

	db(function(err,db){
	    if(err){
		console.log(err) ;
		return next () ;
	    }

	    var emails = db.collection('emails') ;

	    // 保存邮件
	    db.collection("inbox").insert(
		mail
		, function(err) {
		    if(err) console.log(err) ;
		}
	    ) ;


	    // insert/find 邮箱地址
	    emails.findOne({email:mail.to[0].address},function(err,doc){
		if(err){
		    console.log(err) ;
		    return next() ;
		}

		mail.todoc = doc ;

		if(!mail.todoc){
		    mail.todoc = {
			email: mail.to[0]
			, createTime: Date.now()
		    }
		    emails.insert(mail.todoc,function(err,docs){
			if(err)
			    console.log(err) ;
			return next() ;
		    }) ;
		}
		else{
		    return next() ;
		}

	    }) ;
	}) ;
    }
}


