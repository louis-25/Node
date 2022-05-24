const express = require("express");
const http = require("http");
const app = express();
const path = require("path");
const server = http.createServer(app);
const socketIO = require("socket.io");
const cors = require("cors");
const moment = require("moment");

// const io = socketIO(server);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(express.static(path.join(__dirname, "src")));
app.use(cors);

const PORT = process.env.PORT || 5000;

io.on("connection", (socket) => {
  //chatting id로 연결된 소켓에서 전달받은 데이터
  socket.on("chatting", (data) => {
    const { name, msg } = data;
    //연결된 소켓에 data전송
    io.emit("chatting", {
      name,
      msg,
      time: moment(new Date()).format("h:ss A"),
    });
  });
});

server.listen(PORT, () => console.log(`server is running ${PORT}`));
