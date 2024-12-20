const router = require("express").Router();
const { walletToBankTrns } = require("../controller/walletController");
 


// dashboard route

// router.post("/dashboard" , Dashboard );

router.post('/refrelLink' ,  walletToBankTrns );
 





module.exports = router;