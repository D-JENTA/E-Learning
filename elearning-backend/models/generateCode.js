function generateCode(length = 6) {
    const chars = "abcdefghijklmnopqrstuvwxyz1234567890";
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random()*chars.length));
    }
    return code;
}

module.exports = generateCode;