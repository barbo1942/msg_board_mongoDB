var MongoClient = require('mongodb').MongoClient
var ObjectId = require('mongodb').ObjectId
var url = 'mongodb://localhost:27017/msg_board_mongoDB'
var db = null


var DB = {
  connect: function (cb) {  
    MongoClient.connect(url,function (err,mongo) {  
      console.log('Connected successfully to DB server')
      db = mongo
      
      var msg_table = db.collection('msg')
      var user_table= db.collection('user')
      cb(err,db)
    })
  }
}

module.exports = DB
