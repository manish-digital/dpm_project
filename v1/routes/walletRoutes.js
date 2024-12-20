const router = require("express").Router();
const { walletToBankTrns, transferWtWMoney } = require("../controller/walletController");
const authenticateJWT = require("../middlware/loginUser");
 


// dashboard route

// router.post("/dashboard" , Dashboard );

router.post('/wallet/transfer-to-bank' , walletToBankTrns );
router.post('/transferWalletMoney' , authenticateJWT ,  transferWtWMoney );
 





module.exports = router;