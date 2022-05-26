const express = require("express");
const cors = require("cors");
const http = require("http");
const app = express();
const path = require("path");
const server = http.createServer(app);

// DB 연결
const models = require("./models/chat_model.js");
const model = new models();

// 소켓 서버
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(express.static(path.join(__dirname, "src"))); // src폴더를 정적으로 사용하겠다
app.use(cors);

const PORT = process.env.PORT || 5000;

io.on("connection", async (socket) => {
  // console.log('소켓정보', socket);

  console.log('socket connected!',socket.id);    
  // console.log(socket);
  socket.on('joinRoom', (roomId) => {
    let room = roomId;
    socket.join(room);    
    console.log("join room",room);
  })
  socket.on('leaveRoom', (roomId) => {
    let room = roomId;
    socket.leave(room);    
    console.log(room,'room 접속 해제');
  })
  socket.on('deleteMsg', async (chatId) => {     
    try {
      await model.deleteChatData(chatId); // chatId에 해당되는 메세지 DB에서 제거 및 STATUS D로 변경
      io.emit("deleteMsg", chatId);
      console.log(chatId,"번 메세지 제거");
    }catch(e) {
      console.log('deleteMsg 실패', e);
    }
  })
  socket.on("report", async (data) => {
    const { chatId, status, member_id } = data;
    console.log('data', data);
    await model.setChatReport(chatId, status, member_id);
    let getChatId = await model.getChatId(chatId);
    io.emit("report", getChatId);
    await model.setChatReportHistory(chatId);
    
    if(status == "B") { // 차단
      console.log(chatId,'번 데이터 차단됨');
    }else if(status == "R") { // 신고      
      console.log(chatId,'번 데이터 해제됨');
    }else if(status == "B2") { // 차단 해제      
      console.log(chatId,'번 데이터 해제됨');
    }
  })
  //chatting id로 연결된 소켓에서 전달받은 데이터
  socket.on("chatting", async (data) => {
    let { memberId, memberNick, memberImg, msg, time, roomId } = data;
    console.log('id: ',memberId);
    // if(memberId == "") {memberId = "33119";}
    console.log('name: ',memberNick);
    console.log('img: ',memberImg);
    if(memberImg == "") {memberImg = "none.png";}
    console.log('msg: ',msg);
    console.log('time: ',time);
    console.log('roomId: ',roomId);
    
    try {
      socket.join(roomId); // room에 연결
      await model.setChatData(memberId, memberNick, memberImg, msg, roomId, time);
      if(msg=="모든Room에 송출") {
        io.emit('broadcast', {
          memberId,
          memberNick,
          memberImg,
          msg,
          time,
        })
      }
      // const rowData = await model.getUser();
      const rowData = await model.getChatOne(memberId);
      console.log('rowData',rowData);
      io.to(roomId).emit('broadcast', {
        chatId: rowData[0].CHAT_ID,
        memberId: rowData[0].MEMBER_ID,
        memberNick: rowData[0].NAME,
        memberImg: rowData[0].IMG,
        msg: rowData[0].MSG,
        time: rowData[0].REG_DATE,
        status: rowData[0].STATUS
      })
    } catch (e) {
      console.log(e)
    }
    
    socket.on('disconnect', ()=>{
      console.log(roomId,'room 접속 해제');
      socket.leave(roomId);
    })

    // //연결된 소켓에 data전송
    // io.emit(roomName, {
    //   memberId,
    //   memberNick,
    //   memberImg,
    //   msg,
    //   time,
    // });
  });
});

server.listen(PORT, () => console.log(`server is running ${PORT}`));