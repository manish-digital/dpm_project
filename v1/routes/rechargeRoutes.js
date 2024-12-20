const { getoperatorName  , postmobileRecharge, getOperatorOrCircleData, getBrowserPlan } = require("../controller/rechargeController");

const router = require("express").Router();
 


// dashboard route

// router.post("/dashboard" , Dashboard );

// router.post('/mobile-recharge' , mobileRecharge );
router.post('/getOperater' , getoperatorName );
router.post('/mobile-rechargeSumbit' , postmobileRecharge );
router.post('/getOperaterOrCricle' , getOperatorOrCircleData );
router.post('/getbrowerPlan' , getBrowserPlan );




module.exports = router;
 
 