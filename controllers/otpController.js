const verifyOtp = async (req, res) => {
    try{
        const {email, otp} = req.body;

        const user = await User.findOne({where: {email}});
        if(!user){
            return res.status(404).json({message:"user not found"})
        }

        const otpData = await EmailOtp.findOne({
            where:{user_id:user_id, otp}
        });
        if(!otpData){
            return res.status(404).json({message:"invalid otp"})
        };

        if(otpData.expires_at < new Date()){
            return res.status(400).json({message:"otp expired"})
        };

        user.if_verified= true;
        await user.save();

        await otpData.destroy();

        res.json({message:"email verified success"})


    } catch(error){
        console.error(err);
        res.status(500).json({message:"server error"})
    }
}