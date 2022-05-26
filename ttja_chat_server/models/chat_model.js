const config = require("../config/db.js");
const mysql = require("mysql");

const db_config = {
  host: config.database.HOST,
  port: config.database.PORT,
  user: config.database.USER,
  password: config.database.PASSWORD,
  database: config.database.DATABASE
}

// let connection = mysql.createConnection(db_config); // DB 커넥션 생성
// connection.connect((error)=>{
//   if(error) {
//     console.error('mysql connection error : ' + error);
//   }else {
//     console.log('mysql is connected successfully!');
//   }
// }); // DB 접속

let connection = "";
function handleDisconnect() {
  connection = mysql.createConnection(db_config); // Recreate the connection, since
                                                  // the old one cannot be reused.
  connection.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }                                     // to avoid a hot loop, and to allow our node script to
  });                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
  connection.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
  });
}

handleDisconnect();


let sqlQuery = ""

class models {
  async getUser(){
    sqlQuery = "SELECT * FROM TB2_CHAT_DATA;"
    
    connection.query(sqlQuery, (err, result, fields) => {
      console.log('result',result);
      if(err){
        console.log(err);
      } 
      this.result = result;
    });
    return await Promise.resolve(this.result);
  }
  async getChatOne(memberId) { // 해당 멤버의 최신 데이터 하나 반환
    // console.log(memberId);
    sqlQuery = `SELECT CHAT_ID, MEMBER_ID, NAME, IMG, MSG, ROOM_ID, DATE_FORMAT(REG_DATE, "%Y-%m-%d %H:%i:%s") AS REG_DATE, STATUS FROM TB2_CHAT_DATA 
                WHERE CHAT_ID = (SELECT MAX(CHAT_ID) FROM TB2_CHAT_DATA WHERE MEMBER_ID="${memberId}");`;
    
    const query = new Promise((resolve, reject)=>{
      connection.query(sqlQuery, async (err, result, fields) => {      
        if(err){
          reject(console.log(err));
        }       
        // this.result = result
        resolve(result);
      });
    })
    const result = await query;
    return await Promise.resolve(result);
  }
  async getChatId(chatId) { // CHAT_ID에 일치하는 데이터 반환    
    sqlQuery = `SELECT CHAT_ID, MEMBER_ID, NAME, IMG, MSG, ROOM_ID, DATE_FORMAT(REG_DATE, "%Y-%m-%d %H:%i:%s") AS REG_DATE, STATUS, REPORT_MEMBER_ID 
                FROM TB2_CHAT_DATA WHERE CHAT_ID=${chatId}`;
    
    const query = new Promise((resolve, reject)=>{
      connection.query(sqlQuery, async (err, result, fields) => {
        if(err){
          reject(console.log(err));
        }       
        // this.result = result
        resolve(result);
      });
    })
    const result = await query;
    return await Promise.resolve(result);
  }
  async setChatData(memberId, memberNick, memberImg, msg, roomId, time){
    console.log('test',time);
    sqlQuery = `INSERT INTO TB2_CHAT_DATA(MEMBER_ID, NAME, IMG, MSG, ROOM_ID, REG_DATE)
                VALUES(${memberId}, '${memberNick}', '${memberImg}', '${msg}', '${roomId}', '${time}');`

    
    connection.query(sqlQuery, (err, result, fields) => {
      if(err){
        console.log(err);
      } 
      this.result = result;
    });
    return await Promise.resolve(this.result);
  }
  async setChatReport (chatId, status, member_id){    
    if(status == "B2") { // 차단해제
      sqlQuery = `UPDATE TB2_CHAT_DATA SET STATUS = 'Y', REPORT_MEMBER_ID = '0' WHERE CHAT_ID = ${chatId}`;  
    }else {
      sqlQuery = `UPDATE TB2_CHAT_DATA SET STATUS = '${status}', REPORT_MEMBER_ID = '${member_id}' WHERE CHAT_ID = ${chatId}`;
    }

    connection.query(sqlQuery, (err, result, fields) => {
      if(err){
        console.log(err);
      } 
      this.result = result;
    });
    return await Promise.resolve(this.result);
  }
  async setChatReportHistory (chatId){ // 신고,차단 기록하기
    
    sqlQuery = `INSERT INTO TB2_CHAT_REPORT_HISTORY(CHAT_ID, ROOM_ID, MSG, STATUS, REPORT_MEMBER_ID)
                SELECT CHAT_ID, ROOM_ID, MSG, STATUS, REPORT_MEMBER_ID FROM TB2_CHAT_DATA WHERE CHAT_ID=${chatId}`;

    connection.query(sqlQuery, (err, result, fields) => {
      if(err){
        console.log(err);
      } 
      this.result = result;
    });
    return await Promise.resolve(this.result);
  }
  async deleteChatData(chatId){ // seq에 해당되는 데이터의 상태를 D로 변경
    sqlQuery = `UPDATE TB2_CHAT_DATA SET STATUS = 'D' WHERE CHAT_ID=${chatId}`;

    connection.query(sqlQuery, (err, result, fields) => {
      if(err){
        console.log(err);
      } 
      this.result = result;
    });
    return await Promise.resolve(this.result);
  }
}

module.exports = models