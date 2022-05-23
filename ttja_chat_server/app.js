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
  socket.on('joinRoom', (roomName) => {
    let room = roomName;
    socket.join(room);    
    console.log("join room",room);
  })
  socket.on('leaveRoom', (roomName) => {
    let room = roomName;
    socket.leave(room);    
    console.log(room,'room 접속 해제');
  })
  socket.on("report", async (data) => {
    const { seq, status, member_id } = data;
    await model.setChatReport(seq, status, member_id);
    let getChatSeq = await model.getChatSeq(seq);
    if(status == "Y") {
      io.emit("report", getChatSeq);
      await model.setChatReportHistory(seq);
      console.log(seq,'번 데이터 차단됨');
    }else if(status == "D") {
      io.emit("report", getChatSeq);
      await model.setChatReportHistory(seq);
      console.log(seq,'번 데이터 해제됨');
    }
  })
  //chatting id로 연결된 소켓에서 전달받은 데이터
  socket.on("chatting", async (data) => {
    let { memberId, memberNick, memberImg, msg, time, roomName } = data;
    console.log('id: ',memberId);
    // if(memberId == "") {memberId = "33119";}
    console.log('name: ',memberNick);
    console.log('img: ',memberImg);
    if(memberImg == "") {memberImg = "none.png";}
    console.log('msg: ',msg);
    console.log('time: ',time);
    console.log('roomName: ',roomName);
    
    try {
      socket.join(roomName); // room에 연결
      await model.setChatData(memberId, memberNick, memberImg, msg, roomName, time);
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
      io.to(roomName).emit('broadcast', {
        seq: rowData[0].SEQ,
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
      console.log(roomName,'room 접속 해제');
      socket.leave(roomName);
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