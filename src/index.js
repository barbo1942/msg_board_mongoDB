var express = require('express')
var session = require('express-session')
var bodyParser = require('body-parser')


var DB = require('./js/db')
var POSTS = require('./js/posts')
var USER = require('./js/user')
var MSG = require('./js/msg')

var posts_table = null
var user_table = null
var msg_table = null

var app = express()
var mode = "read"
var limit = 3
var tab = null
var nowPage = 1
var tabList = {
  'tech': '科技',
  'job': '徵才',
  'event': '活動'
}

// 使用 session，要設定一個 secret key
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}))

// 有了這個才能透過 req.body 取東西
app.use(bodyParser.urlencoded({
  extended: false
}))


//加了express.static 才可引入css
app.use(express.static(__dirname))
// console.log(__dirname)

app.set('view engine','ejs')

// 首頁，直接輸出所有留言
app.get('/',function (req,res) {  
  // 試著看看 session 裡面有沒有 username 可以拿
  // 判斷是否是管理員
  var username = req.session.username
  var isAdmin = false
  if (username=='admin') {
    isAdmin = true
  }

  // 拿出所有的留言
  POSTS.getPosts(function (err,posts) {  
    if (err) {
      res.send(err)
    } else {
      res.render(__dirname+'/html/index.ejs',{
        username: username,
        isAdmin: isAdmin,
        posts: posts.reverse(),
        tab_zn: null,
        mode: mode,
        total_length: posts.length,
        tab_length: null,
        tmp_length: posts.length,
        limit: limit,
        tab: null,
        nowPage: 1
      })
    }
  })
})

//delete
app.get('/posts/delete/:id',function (req,res) {  
  var id = req.params.id

  
  POSTS.deletePost(id,function (err,data) {  
    if (err){
      res.send(err)
    } else {
      res.redirect('/')
    }
  })
})

app.get('/posts/like/:id',function (req,res) {  
  var id = req.params.id
  POSTS.addLike(id)
  res.redirect('/posts/'+id)
})

// 發表新文章的頁面
app.get('/posts/add',function (req,res) {  
  res.render(__dirname+'/html/newpost.ejs',{username: req.session.username})
})

// addPost
app.post('/posts/add',function (req,res) {  
  var post = {}
  var d = new Date()  
  
  post.author = req.session.username
  post.title = req.body.title
  
  post.content = req.body.content
  post.like = 0
  post.explore = 0
  var obj ={}
  switch(req.body.tabItem){
    case 'tech':
      obj.tech = "技術"
      break
    case 'job':
      obj.job = "徵才"
      break
    case 'event':
      obj.event = "活動"
      break
  }
  post.tab = Object.assign({},obj)
  post.createTime = (d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate())
  
  POSTS.addPost(post,function (err,data) {  
    if (err) {
      res.send(err)
    } else {
      res.redirect('/')

    }
  })
})

app.get('/login/:post_id',function (req,res) {  
  var post_id = req.params.post_id
  console.log("post_id: ",post_id)
  if (post_id == ""){
    post_id = null
  }
  res.render(__dirname+'/html/login.ejs',{
    post_id: post_id
  })
})


app.post('/login/:post_id',function (req,res) {  
  var username = req.body.username
  var pwd = req.body.pwd
  var post_id = req.params.post_id
  if (post_id =='null') { post_id = null}
  
  if (username ==='admin' && pwd ==='admin'){
    req.session.username = 'admin'
    console.log(username+' login success')
    if (post_id) {
      res.redirect('/msg/add/'+post_id)
    } else {
      res.redirect('/')
    }
    
  } else {
    USER.verifyUser(username,pwd,function (err,result) {  
      if ( result == true ){
        req.session.username = username
        console.log(username+' login success')
        console.log(post_id)
        
        if (post_id) {
          res.redirect('/msg/add/'+post_id)
        } else {
          res.redirect('/')
        }
      } else {
        // alert('login fail'）
        //只能運行在window不是server
        console.log(username+' login fail')
        res.render(__dirname+'/html/login.ejs',{
          post_id: post_id
        })
      }
    })
    
  } 
})


app.get('/logout',function (req,res) {  
  req.session.destroy()
  mode = "read"
  res.redirect('/')
})

app.get('/register',function (req,res) {  
  res.render(__dirname+'/html/register.ejs')
})

app.post('/register',function (req,res) {  
  var newUser = {}
  newUser.username = req.body.username
  newUser.pwd = req.body.pwd
  newUser.createTime = new Date()
  USER.addUser(newUser,function (err,data) {  
    if (err) {
      res.send(err)
    } else {
      req.session.username = newUser.username
      res.redirect('/')
    }
  })
})

app.get('/config',function (req,res) {  
  res.render(__dirname+'/html/config.ejs')
})

app.post('/config',function (req,res) { 
  var username = req.session.username
  var pwd1 = req.body.pwd1
  var pwd2 = req.body.pwd2
  if (pwd1 === pwd2) {
    USER.changePwd(username,pwd1)
    res.redirect('/')
  } else {
    console.log('密碼不相同')
    res.redirect('/config')
  }
})

app.get('/posts/:id',function (req,res) {  
  var id = req.params.id
  var username = req.session.username
 
  POSTS.getOnePost(id,function (err,post) {     
    if ( err ) {
      res.send(err)
    } else {
      MSG.getOnePostMsgs(id,function (err,post_msgs) {     
        if (err) {
          res.send(err)
        } else {
            res.render(__dirname+'/html/post.ejs',{
            username: username,
            post: post[0],
            mode: mode,
            msgs: post_msgs.reverse()
          })
        }
      })


    }
   })
})

app.get('/posts',function (req,res) {  
  var tab = req.query.tab
  var page =req.query.page
  if (page==null) { 
    page = 1 
  } else {
    page = Number(page)
  }
  if (tab =="") {tab = null}
  // console.log('tab: ',tab)
  // console.log('page: ',page)
  
  var username = req.session.username
  var isAdmin = false
  if (username=='admin') {
    isAdmin = true
  }

  POSTS.getPosts(function (err,posts) {  
    if (err) {
      res.send(err)
    } else {
      
        total_length = posts.length
        // console.log("posts:",posts)
        if (tab!=null) {  
          var tab_posts = posts.filter(function (post,index,array) { 
            for(key in post.tab){
              return (key == tab)
            } 
          })
          let tab_length = tab_posts.length
          var tab_zn = tabList[tab]
          var tmp_posts = tab_posts
        } else {
          tmp_posts = posts
        }
        var tmp_length = tmp_posts.length
        var tmp_page = Math.ceil(tmp_length/limit)
        var start = (page-1)*limit
        var end 
        if (page==tmp_page){
          end = tmp_length
        }else {
          end = start + limit
        }    
        page_posts = tmp_posts.slice(start,end)
            
        res.render(__dirname+'/html/index.ejs',{
          username: username,
          isAdmin: isAdmin,
          posts: page_posts.reverse(),
          tab_zn: tab_zn,
          mode: mode,
          total_length: total_length,
          tab_length: tmp_length,
          tmp_length: tmp_length,
          limit: limit,
          tab: tab,
          nowPage: page
        
        })
      
      
    }
  })



})

app.get('/mode',function (req,res) { 
  mode = req.query.mode
  var path = req.query.path
  var tab = req.query.tab 
  if (tab == "") {
    res.redirect('/')
  } else {
    res.redirect('/posts/?tab='+tab)
  }
})

app.get('/msg/add/:post_id',function (req,res) {
  var post_id = req.params.post_id
  if (req.session.username){
      res.render(__dirname+'/html/newmsg.ejs',{
      mode: "read",
      username: req.session.username,
      post_id: post_id
      })
  } else {
     res.redirect('/login/'+post_id)
  }
})

app.post('/msg/add',function (req,res) {  
  var content = req.body.content
  var post_id = req.body.post_id

  var d = new Date()
  var msg = {
    post_id:  post_id,
    author: req.session.username,
    content: content,
    createTime: (d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate())
  }
  MSG.addMsg(msg,function (err,data) { 
    if (err) {
      res.send(err)
    } else {
      res.redirect('/posts/'+ post_id)
    }
  })
})

DB.connect(function (err,db) {  
  posts_table = db.collection('posts')
  user_table = db.collection('user')
  msg_table = db.collection('msg')
  POSTS.connect(posts_table)
  USER.connect(user_table)
  MSG.connect(msg_table)
 
  // console.log('posts:', posts_table)
  
  app.listen(3000, function () { 
    console.log('server: on port 3000')
  })
})

