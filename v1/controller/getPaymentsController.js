const Razorpay = require("razorpay");
const crypto = require("crypto");
const {
  updateWalletInDb,
  addTransHistory,
  getTransDetails,
  getUserBalanceInDb,
  getUserTransHistoryInDb,
  updateWalletTransTypeInDb,
} = require("../services/getPaymentsServices");
const {
  validateGetPayment,
  validatePaymentWebhook,
  validateGetWaletBalance,
  validategetUserTransactionHistory,
} = require("../validation/paymentsValidation");
const { emitEvent } = require("../socket/socketServer");

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET,
});

// Endpoint to create order
const getpayments = async (req, res) => {
  try {
    const { amount, currency, receipt, payment_capture, user_id } = req.body;
    console.log(user_id, " user_id");
    req.body["amount"] = parseInt(amount);
    let validateRequest = validateGetPayment(req.body);

    if (!validateRequest.isValid) {
      return res.validationError({
        message: `Invalid values in parameters, ${validateRequest.message}`,
      });
    }
    // const payment_data = {
    //   amount: amount,
    //   currency: currency,
    //   receipt: receipt,
    //   payment_capture: payment_capture || 1,
    // };

    const option = {
      amount: amount * 100, // Amount in smallest currency unit (paise for INR)
      currency: "INR",
      receipt: `wallet_txn_${user_id}_${Date.now()}`,
      payment_capture: 1,
    };

    const razorpayOrder = await razorpay.orders.create(option);
    // razorpayOrder["user_id"] = user_id
    res.json(razorpayOrder);

    //  {
    //  data : order
    //   message: "Order created. Await payment.",
    //   order_id: razorpayOrder.id, }

    const transactionOptions = {
      user_id: user_id,
      transaction_id: razorpayOrder.id,
      type: "credit",
      amount: amount,
    };
    const resultWalletTrans = await addTransHistory(transactionOptions);
    if (resultWalletTrans.status == 400) {
      console.log({
        message: result.data,
        FunctionName: "addTransHistory",
        FileName: "getpaymentsController",
      });
      return res.badRequest({ message: result.data });
    }
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).send("Error creating order");
  }
};

// Endpoint to verify payment

const handlePaymentWebhook = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
    // Validate request data
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.badRequest({
        message: "Invalid payload: Missing required Razorpay fields.",
      });
    }

    let validateRequest = validatePaymentWebhook(req.body);

    if (!validateRequest.isValid) {
      return res.validationError({
        message: `Invalid values in parameters, ${validateRequest.message}`,
      });
    }

    // Generate expected signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.json({
        success: false,
        message: "Payment verification failed. Signature mismatch.",
      });
    }

    // Fetch transaction details
    const transactionDetails = await getTransDetails(razorpay_order_id);
    if (!transactionDetails && transactionDetails.data.status !== "pending") {
      return res.badRequest({
        message: "Transaction already processed or not found.",
      });
    }

    const paymentAmount = transactionDetails.data[0].amount; // Convert to INR
    const userId = transactionDetails.data[0].user_id;

    // Update wallet balance
    const walletUpdateResult = await updateWalletInDb(paymentAmount, userId);
    if (walletUpdateResult.data.status === 400) {
      console.error({
        message: walletUpdateResult.data,
        functionName: "updateWalletInDb",
        fileName: "getpaymentsController",
      });
      return res.badRequest({ message: "Failed to update wallet balance." });
    }

    // Update transaction status in wallet_transactions
    const transactionUpdateResult = await updateWalletTransTypeInDb(
      razorpay_order_id
    );
    if (transactionUpdateResult.status === 400) {
      console.error({
        message: transactionUpdateResult.data,
        functionName: "updateWalletTransTypeInDb",
        fileName: "getpaymentsController",
      });
      return res.badRequest({
        message: "Failed to update transaction status.",
      });
    }
    emitEvent("fetchWalletBalance", { message: "Wallet balance updated." });

    // Respond with success
    return res.success({
      success: true,
      message: "Payment successful and wallet updated.",
    });
  } catch (error) {
    // Log error and respond
    console.error({
      message: error.message,
      functionName: "handlePaymentWebhook",
      fileName: "getpaymentsController",
    });
    return res.internalServerError({
      message: "An error occurred while processing the payment.",
    });
  }
};

const getUserWalletBalance = async (req, res) => {
  try {
    const { user_id } = req.params;
    console.log(user_id, "useridwallet");
    req.params["user_id"] = parseInt(user_id);
    // const [result] = await db.query("SELECT balance FROM users_wallets WHERE user_id = ?", [user_id]);
    let validateRequest = validateGetWaletBalance(req.params);
    if (!validateRequest.isValid) {
      return res.validationError({
        message: `Invalid values in parameters, ${validateRequest.message}`,
      });
    }
    const result = await getUserBalanceInDb(user_id);
    if (result.status == 400) {
      return res.badRequest({ message: result.data });
    }
    if (result.status == 409) {
      return res.recordNotFound({ message: result.data });
    }
    return res.success({
      data: result.data,
      message: "get User Wallet Balance fetched successfully",
    });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

const getUserTransactionHistory = async (req, res) => {
  try {
    const { user_id } = req.params;
    req.params["user_id"] = parseInt(user_id);

    let validateRequest = validategetUserTransactionHistory(req.params);
    if (!validateRequest.isValid) {
      return res.validationError({
        message: `Invalid values in parameters, ${validateRequest.message}`,
      });
    }
    const result = await getUserTransHistoryInDb(user_id);

    if (result.status == 400) {
      return res.badRequest({ message: result.data });
    }
    if (result.status == 409) {
      return res.recordNotFound({ message: result.data });
    }
    return res.success({
      data: result.data,
      message: "get User Transtion Balance fetched successfully",
    });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};



module.exports = {
  getpayments,
  handlePaymentWebhook,
  getUserWalletBalance,
  getUserTransactionHistory,
  
};
