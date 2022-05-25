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
connection.connect((error)=>{
  if(error) {
    console.error('mysql connection error : ' + error);
  }else {
    console.log('mysql is connected successfully!');
  }
}); // DB 접속


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
    sqlQuery = `SELECT SEQ, MEMBER_ID, NAME, IMG, MSG, ROOM_ID, DATE_FORMAT(REG_DATE, "%Y-%m-%d %H:%i:%s") AS REG_DATE, STATUS FROM TB2_CHAT_DATA 
                WHERE SEQ = (SELECT MAX(SEQ) FROM TB2_CHAT_DATA WHERE MEMBER_ID="${memberId}");`;
    
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
  async getChatSeq(seq) { // Seq에 일치하는 데이터 반환    
    sqlQuery = `SELECT SEQ, MEMBER_ID, NAME, IMG, MSG, ROOM_ID, DATE_FORMAT(REG_DATE, "%Y-%m-%d %H:%i:%s") AS REG_DATE, STATUS, REPORT_MEMBER_ID 
                FROM TB2_CHAT_DATA WHERE SEQ=${seq}`;
    
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
  async setChatReport (seq, status, member_id){    
    if(status == "B2") { // 차단해제
      sqlQuery = `UPDATE TB2_CHAT_DATA SET STATUS = 'Y', REPORT_MEMBER_ID = '0' WHERE SEQ = ${seq}`;  
    }else {
      sqlQuery = `UPDATE TB2_CHAT_DATA SET STATUS = '${status}', REPORT_MEMBER_ID = '${member_id}' WHERE SEQ = ${seq}`;
    }

    connection.query(sqlQuery, (err, result, fields) => {
      if(err){
        console.log(err);
      } 
      this.result = result;
    });
    return await Promise.resolve(this.result);
  }
  async setChatReportHistory (seq){ // 신고,차단 기록하기
    
    sqlQuery = `INSERT INTO TB2_CHAT_REPORT_HISTORY(SEQ, ROOM_ID, MSG, STATUS, REPORT_MEMBER_ID)
                SELECT SEQ, ROOM_ID, MSG, STATUS, REPORT_MEMBER_ID FROM TB2_CHAT_DATA WHERE SEQ=${seq}`;

    connection.query(sqlQuery, (err, result, fields) => {
      if(err){
        console.log(err);
      } 
      this.result = result;
    });
    return await Promise.resolve(this.result);
  }
  async deleteChatData(seq){ // seq에 해당되는 데이터의 상태를 D로 변경
    sqlQuery = `UPDATE TB2_CHAT_DATA SET STATUS = 'D' WHERE SEQ=${seq}`;

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