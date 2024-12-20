const router = require("express").Router();
const { getpayments, handlePaymentWebhook, getUserWalletBalance, getUserTransactionHistory } = require("../controller/getPaymentsController");
 


// dashboard route

// router.post("/dashboard" , Dashboard );

router.post('/testGetway' , getpayments );
router.post('/payment-success' , handlePaymentWebhook  );
router.get('/getWalletBalance/:user_id' , getUserWalletBalance );
router.get('/getTransHistory/:user_id' ,  getUserTransactionHistory );





module.exports = router;