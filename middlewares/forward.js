var nodemailer = require("nodemailer");


module.exports = function(forwardList,smtpconfig){

    var smtpTransport = nodemailer.createTransport("SMTP",smtpconfig);

    return function(mail,next,reject){

	var to = mail.to[0].address.toLowerCase() ;

	for(var i=0;i<forwardList.length;i++){
	    var metafw = forwardList[i] ;

	    if( metafw.match && to.match(metafw.match) ) {

		var forwardingMail = {} ;
		for(name in mail){
		    forwardingMail[name] = mail[name] ;
		}
		delete forwardingMail.todoc ;
		forwardingMail.envelope = {
		    from: smtpconfig.from || tidyAddressList(mail.from).join(', ')
		    , to: metafw.to.join(', ')
		} ;
		delete forwardingMail.headers.received ;
		delete forwardingMail.from
		delete forwardingMail.to ;
		delete forwardingMail.headers.subject ; 
		delete forwardingMail.headers['content-transfer-encoding'] ; // forwardingMail.html 已经解码

		forwardingMail.subject = "(转发：" + mail.from[0].address + "→" + mail.to[0].address + ") " + forwardingMail.subject ;
		console.log(forwardingMail.subject) ;

		if(forwardingMail.html){
		    forwardingMail.html = "<p style='margin-bottom: 20px;color: red;'>【该邮件来自 " + mail.from[0].address + "，发送给你的邮箱 " + mail.to[0].address + "】</p>" + forwardingMail.html ;
		}
		if(forwardingMail.text){
		    forwardingMail.text = "【该邮件来自 " + mail.from[0].address + "，发送给你的邮箱 " + mail.to[0].address + "】\r\n\r\n" + forwardingMail.text ;
		}


		// send mail with defined transport object
		smtpTransport.sendMail(
		    forwardingMail
		    , function(error, response){
			if(error){
			    console.log(error);
			}else{
			    console.log( "邮件已转发至：" + forwardingMail.envelope.to );
			}
		    }
		);


		// forward
		break ;
	    }
	}

	next() ;
    }
}

function tidyAddressList(list){
    var ret = [] ;
    for(var i=0;i<list.length;i++) {
	ret.push(list[i].address) ;
    }
    return ret ;
}


