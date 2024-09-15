import http from "http";
import Socketservice from "./services/socket";
import { Startconsumer } from "./services/kafka";
async function init() {
    const socketService = new Socketservice();
    
    Startconsumer();

    const httpServer = http.createServer();
    const PORT = process.env.PORT ? process.env.PORT : 3001;
  
    socketService.io.attach(httpServer);
  
    httpServer.listen(PORT, () =>
      console.log(`HTTP Server started at PORT:${PORT}`)
    );
  
    socketService.initListener();
};
init();

