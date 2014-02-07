YouDontKnowMyEmail
==================


Nodejs实现的一个临时邮件服务，当你需要在某些网站注册用户，但又不想透露自己的邮箱时，可以使用 ydkme 生成的临时的邮箱。ydkme 会在收到邮件时，自动生成邮箱。你可以通过邮箱的名称来命令 ydkme 如何处理收到的邮件。 :D



# 如何使用

* 用一个自动创建的临时邮箱,来隐藏你的真实邮箱。

  例如，你在新浪微博上注册时，使用这个邮箱地址：weibo.com@your-doname.com ，当新浪微博向该地址发送邮件时，ydkme 会接收并转发到你的真实邮箱，从而向你要注册的网站隐藏了你的真实邮箱；并且这个 weibo.com@your-doname.com 不需要事先创建。

* 注册用户时，每个网站都使用不同的邮箱，以后可以单独禁用每一个邮箱

* 如果@前面部分都用注册网站的域名，那么，当你收到垃圾邮件的时候，你就能知道是哪个网站泄露了你的隐私。

  如果 weibo.com@you-doname.com 收到了垃圾邮件，那就是 weibo.com “出卖”了你的隐私，因为你只在 weibo.com 上注册时使用过这个地址。

* 可以在邮箱名称里使用参数：
  
** 指定该邮箱的有效时间，格式：`-[h|w|d|m]<数字>`

   例如：  weibo.com`-h12`@your-doname.com  ，则该邮箱仅在首次收到邮件后，12小时以内有效；超过有效时间则自动进入禁用状态。
   
   h 小时 / w 周 / d 天 / m 月

** （尚未实现）自动点击邮件里的链接， 格式：`-ac`

   例如： weibo.com`-ac`@your-doname.com ，不管邮件里是什么内容，正文里的链接都会被 ydkme 自动点击一次。 这可以用于注册时的邮箱验证。
   


# 安装和部署

## 环境

* Nodejs / NPM
* MongoDB
* PM2 (可选)
* 一个你自己的域名


## 安装和配置

0. ydkme 是一个 SMTP 服务器，在安装和启动ydkme 以前，你要先将一个域名的MX记录解析到你的服务器，并且打开服务器防火墙的 25端口


1. 用 NPM 安装 ydkme :

```
sudo npn i ydkme -g
```

2. 任意编辑器创建配置文件 `/etc/ydkme.config.json` ，复制并修改以下内容 ：

```javascript
{
    "port": 25
    , "db": {
	"url": "mongodb://localhost:27017/ydkme"
    }
    , "forwards": [
	{
	    "match": "@alee.chou.im$"
	    , "to": [ "alee@chou.im" ]
	}
    ]
    , "forwarder": {
	"service": "Gmail"
	, "auth": {
	    "user": "<your smtp user>"
	    , "pass": "<your smtp password>"
	}
    }
}
```

### 配置文件说明：

* `forwards` 属性是一个数组， `forwards.[].match` 是一个正则表达式，其配置的邮箱，将会转发到 `forwards.[].to` 指定的邮箱里（注意，to也是一个数组）

* `forwarder` 属性需要你提供一个有效的 smtp 账号，其配置说明参考 nodemailer

## 启动 ydkme

so easy :

```
sudo ydkme
```

## 使用 PM2 启动和维护 ydkme

0. 安装 pm2

```
sudo npm i pm2 -g
```

1. 用 PM2 启动 ydkme：

```
sudo pm2 start `which ydkme`
```

2. 设置为系统服务(Daemon)

```
sudo pm2 startup
sudo pm2 dump
```

3. 查看输出：

```
sudo pm2 logs
```



