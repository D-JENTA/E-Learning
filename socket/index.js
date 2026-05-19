const {Server} = require("socket.io");

let io;

const initSocket = (httpServer) => {
    io = new Server(httpServer,{
        cors : {origin : "*"}
    });

    io.on("connection",socket => {
        console.log(
            "socket connected : ",
            socket.id
        )

        socket.on("join", userId => {
            socket.join(`user_${userId}`)
        });

        socket.on("disconnect", () => {
            console.log("socket disconnected : ",socket.id )
        });
    });
    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error("socket.io not initialized");
    }
    return io;
};

module.exports = {initSocket, getIO}