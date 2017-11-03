var ObjectId = require('mongodb').ObjectId
var posts_table = null

var POSTS = {
  connect: function (table) {  
    posts_table = table
  },
  getPosts: function (cb) {  
    // let posts_table = db.collection('posts')
    posts_table.find({}).toArray(function (err,data) {  
      cb(err,data)
    })
  },
  addPost: function (post,cb) {  
    // let table = db.collection('posts')
    posts_table.insert(post,function (err,result) {  
      cb(err,result)
    })
  },
  deletePost: function (id,cb) {  
    // let table = db.collection('posts')
    posts_table.deleteOne({ _id: ObjectId(id)}, function (err,result) {  
      // console.log(err,result)
      cb(err,result)      
    })
  },
  addLike: function (id) {  
    // let table = db.collection('posts')
    posts_table.update({_id: ObjectId(id)},{$inc: {like: 1, explore: -1} },function (err,data) {
      // console.log("update like")
    })
  },
  addExplore: function (id) {  
    // let table = db.collection('posts')
    posts_table.update({_id: ObjectId(id)},{$inc: {explore: 1} },function (err,data) {
      // console.log("update explore")
    })
  },
  getOnePost: function(id,cb){
    // let table = db.collection('posts')
    POSTS.addExplore(id)
    posts_table.find({_id: ObjectId(id)}).toArray(function (err,data) {  
      cb(err,data)
    })
  }

}

module.exports = POSTS
// DB.connect(function (err) {  


//   DB.getPosts(function (err,posts) {  
//         console.log(posts)
//       })

//   let id= '59f933f64883b41c02b6d0ea'
//   // DB.addLike(id)

//   // let del_id ='59f933f64883b41c02b6d0e9'
//   // DB.deletePost(del_id,function (err,data) {  })

//   // let post = {
//   //   title: '文章3',
//   //   author: 'user3',
//   //   like: 0,
//   //   explore: 0
//   // }
//   // DB.addPost(post,function (err,data) { })
//   DB.getOnePost(id,function (err,post) { 
//     console.log(post)
//    })
//   // DB.getPosts(function (err,posts) {  
//   //   console.log(posts)
//   // })
// })