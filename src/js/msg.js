var ObjectId = require('mongodb').ObjectId
var msg_table = null

var MSG = {
  connect: function (table) {  
    msg_table = table
  },
  getMsgs: function (cb) {  
    msg_table.find({}).toArray(function (err,data) {  
      cb(err,data)
    })
  },
  addMsg: function (msg,cb) {  
    msg_table.insert(msg,function (err,result) {  
      cb(err,result)
    })  
  },
  deleteMsg: function (id,cb) {  
    msg_table.deleteOne({_id: ObjectId(id)},function (err,result) {  
      cb(err,result)
    })
  },
  getOnePostMsgs: function(id,cb) { 

    
    msg_table.find({post_id: id}).toArray(function (err,data) {  
      cb(err,data)
    })
  }
}

module.exports = MSG

// DB.connect(function (err,mongo_db) {
//   db = mongo_db 
//   msg_table = db.collection('msg')

  // let msg = {
  //   post_id: "post_id 00989",
  //   author: "user2",
  //   content: "content2",
  //   createTime: new Date()
  // }
  // MSG.addMsg(msg,function (err,result) {  })

  // let msg_id = '59fa888b885b3b087a9a9c9b'
  // MSG.deleteMsg(msg_id,function (param) {  })

  // MSG.getMsgs(function (err,data) {
  //   console.log(data)
  //   })
// })


// var id = 1508921668174
// MSG.getOnePostMsg(id,function (err,data) { 
  
//  })