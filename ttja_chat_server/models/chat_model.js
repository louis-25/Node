const config = require("../config/db.js");
const mysql = require("mysql");

const conn = {
  host: config.database.HOST,
  port: config.database.PORT,
  user: config.database.USER,
  password: config.database.PASSWORD,
  database: config.database.DATABASE
}

let connection = mysql.createConnection(conn); // DB 커넥션 생성
connection.connect(); // DB 접속

let testQuery = ""

class models {
  async getUser(){
    testQuery = "SELECT * FROM TB2_CHAT_DATA;"
    
    connection.query(testQuery, (err, result, fields) => {
      if(err){
        console.log(err);
      } 
      this.result = result;
    });
    return await Promise.resolve(this.result);
  }
  async setChatData(memberId, memberNick, memberImg, msg, time, socket){
    testQuery = "INSERT INTO TB2_CHAT_DATA(USER_ID, NAME, IMG, MSG, SOCKET, REG_DATE)"
              +`VALUES(${memberId}, '${memberNick}', '${memberImg}', '${msg}', '${socket}', '${time}');`

    
    connection.query(testQuery, (err, result, fields) => {
      if(err){
        console.log(err);
      } 
      this.result = result;
    });
    return await Promise.resolve(this.result);
  }
}

module.exports = models


