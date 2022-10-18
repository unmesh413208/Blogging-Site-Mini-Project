const authorModel = require("../models/authorModel")
const jwt = require("jsonwebtoken")

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>



const loginUser = async function (req, res) {
    
    let user = await authorModel.findOne(req.body);
    if (!user)
      return res.status(400).send({
        status: false,
        msg: "Bad Request. username or the password is not corerct",
      });
    let token = jwt.sign(
      {
        userId: user._id.toString(),
        room: "23",
        Project: "BlogProject",
      },
      "bidipta-jiyalal-unmesh"
    );
    res.setHeader("x-api-key", token);
    res.send({ status: true,msg: "Login Successfull", data: token });
  };



  
//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>




  module.exports.loginUser = loginUser