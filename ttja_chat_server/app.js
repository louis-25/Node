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
  console.log('socket connected!');
  
  //chatting id로 연결된 소켓에서 전달받은 데이터
  socket.on("chatting", (data) => {
    const { memberId, memberNick, memberImg, msg, time, socket } = data;
    console.log('id: ',memberId);
    console.log('name: ',memberNick);
    console.log('img: ',memberImg);
    console.log('msg: ',msg);
    console.log('time: ',time);
    console.log('socket: ',socket);

    model.setChatData(memberId, memberNick, memberImg, msg, time, socket);
    //연결된 소켓에 data전송
    io.emit("chatting", {
      memberId,
      memberNick,
      memberImg,
      msg,
      time,
    });
  });
});

server.listen(PORT, () => console.log(`server is running ${PORT}`));