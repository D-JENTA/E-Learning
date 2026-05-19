const getIO = require("../socket/index")

class NotificationService {
    static send({receiverId, event, payload}) {
        const io = getIO();
        io.to(`user_${receiverId}`).emit(event, payload);
    }
}

module.exports = NotificationService;