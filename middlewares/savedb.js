var mongodb = require('mongodb') ;

module.exports = function(mongourl){

    var dbconn ;
    function db(cb){
	if(!dbconn)
	    mongodb.MongoClient.connect(mongourl,cb) ;
	else
	    cb && cb(null,dbconn) ;
    }
    

    return function (req,next){
	if(!req.to[0])
	    return next() ;

	db(function(err,db){
	    if(err){
		console.log(err) ;
		return next () ;
	    }

	    var emails = db.collection('emails') ;

	    // insert/find 邮箱地址
	    emails.findOne({email:req.to[0]},function(err,doc){
		if(err){
		    console.log(err) ;
		    return next() ;
		}

		req.todoc = doc ;

		if(!req.todoc){
		    req.todoc = {
			email: req.to[0]
			, createTime: Date.now()
		    }
		    emails.insert(req.todoc,function(err,docs){
			if(err)
			    console.log(err) ;
			return next() ;
		    }) ;
		}
		else{
		    return next() ;
		}

	    }) ;

	    // 保存邮件
	    db.collection("inbox").insert(
		{
		    to: req.to[0]
		    , date: Date.now()
		    , contents: req.contents
		    , from: req.from
		}
		, function(err) {
		    if(err) console.log(err) ;
		}
	    ) ;
	}) ;
    }
}


