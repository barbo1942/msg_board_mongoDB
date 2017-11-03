var ObjectId = require('mongodb').ObjectId
var user_table = null

var USER = {
  connect: function (table) {  
    user_table = table
  },
  getUsers: function (cb) {  
    user_table.find({}).toArray(function (err,data) {  
      cb(err,data)
    })
  },
  addUser: function (user,cb) {  
    user_table.insert(user,function (err,result) {  
      cb(err,result)
    })
  },
  deleteUser: function (id,cb) {  
    user_table.deleteOne({_id: ObjectId(id)},function (err,result) {  
      // console.log(err,result)
      cb(err,result)
    })
  },
  verifyUser: function (username,pwd,cb) { 
    var isVerify = false 
    user_table.find({username: username,pwd: pwd}).toArray(function (err,result) {        
      if (result[0] != null) {
        isVerify = true
      }
      cb(err,isVerify)
    })  
    
  },
  changePwd: function (id,newPwd,cb) {  
    user_table.update({_id: ObjectId(id)},{$set: {pwd: newPwd}},function (err,result) {  
      cb(err,result)
    })
  }
}


module.exports = USER


// DB.connect(function (err,mongo_db) {
//   db = mongo_db 
//   user_table= db.collection('user')

  // var user = {
  //   username: 'user3',
  //   pwd: 'user3'
  // }
  // USER.addUser(user,function (err,data) {  })
 
  // let id = '59fa7cc3018342067cab42f1'
  // USER.deleteUser(id,function (err,data) {  })

  // console.log('return :', USER.verifyUser('user1','user1'))
  
// USER.verifyUser('user2','user2',function (err,result) {  
//     console.log('verfifyUser',result)
//   })

// var id = '59fa7cbad04f1106752a54e4'
// USER.changePwd(id,"user2",function (err,result) {  })
  
//   USER.getUsers(function (err,data) {  
//     console.log("users: ",data)
//   })

// })