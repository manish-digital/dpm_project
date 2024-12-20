const {  UserRegister, MerchantRegister, AdminRegister, UserLogin } = require("../controller/authController");

const router = require("express").Router();

// user login route
// router.post("/login", login );
// router.post("/reg" , signUp );


// Admin 
// router.post("/adminLogin" , AdminLogin ) ; 




// user 
router.post("/userReg" , UserRegister );
router.post("/merchantReg" , MerchantRegister);
router.post("/adminReg" , AdminRegister);



// userLogin  
router.post("/userLogin" , UserLogin);












module.exports = router;
