const Razorpay = require("razorpay");
const { getUserBalanceInDb } = require("../services/getPaymentsServices");
const {
  deductResultIndb,
  addAmountResultIndb,
  senderWalletTrnResultIndb,
  receiverWalletTrnResultIndb,
} = require("../services/walletService");
const { emitEvent } = require("../socket/socketServer");

const {
  validatetransferWtWMoney,
  validatewalletToBankTrns,
} = require("../validation/walletValidation");
const { constants } = require("crypto");

// const transferWtWMoney = async (req, res) => {
//   try {
//     const { amount, mobileNumber } = req.body;
//     const sender_id = req._user.id;
//     console.log(sender_id , "sender")
//     req.body["amount"] = parseInt(amount);
//     req.body["mobileNumber"] = parseInt(mobileNumber);
//     let validateRequest = validatetransferWtWMoney(req.body);
//     if (!validateRequest.isValid) {
//       return res.validationError({
//         message: `Invalid values in parameters, ${validateRequest.message}`,
//       });
//     }

//     const transferMoneyData = {
//       amount: amount,
//       phone: mobileNumber,
//       sender_id: sender_id,
//     };

//     // Deduct amount from sender's wallet
//     const deductResult = await deductResultIndb(transferMoneyData);
//     if (deductResult.status === 400) {
//       return res.badRequest({ message: result.data });
//     }

//     // Add amount to receiver's wallet
//     const addAmountResult = await addAmountResultIndb(transferMoneyData);

//     if (addAmountResult.status === 400) {
//       return res.badRequest({ message: result.data });
//     }
//     // Log transaction for sender
//     const senderWalletTrnResult = await senderWalletTrnResultIndb(
//       transferMoneyData
//     );
//     if (senderWalletTrnResult.status === 400) {
//       return res.badRequest({ message: result.data });
//     }

//     // Log transaction for receiver
//     const receiverWalletTrnResult = await receiverWalletTrnResultIndb(
//       transferMoneyData
//     );
//     if (receiverWalletTrnResult.status === 400) {
//       return res.badRequest({ message: result.data });
//     }

//     return res.success({

//       message: `${amount} is transfer is succesfully . `,
//     });
//   } catch (error) {
//     return res.internalServerError({ message: error.message });
//   }
// };
const transferWtWMoney = async (req, res) => {
  try {
    const { amount, mobileNumber } = req.body;
    const sender_id = req._user.id;

    // Sanitize and validate inputs
    req.body["amount"] = parseInt(amount);
    req.body["mobileNumber"] = parseInt(mobileNumber);

    let validateRequest = validatetransferWtWMoney(req.body);
    if (!validateRequest.isValid) {
      return res.validationError({
        message: `Invalid values in parameters, ${validateRequest.message}`,
      });
    }

    const transferMoneyData = {
      amount: amount,
      phone: mobileNumber,
      sender_id: sender_id,
    };

    // Deduct amount from sender's wallet
    try {
      const deductResult = await deductResultIndb(transferMoneyData);

      if (deductResult.status === 400) {
        return res.badRequest({ message: deductResult.data });
      }
    } catch (error) {
      console.error("Error deducting from sender's wallet:", error.message);
      return res.internalServerError({
        message: "Error processing sender's wallet deduction",
      });
    }

    // Add amount to receiver's wallet
    try {
      const addAmountResult = await addAmountResultIndb(transferMoneyData);

      if (addAmountResult.status === 400) {
        return res.badRequest({ message: addAmountResult.data });
      }
    } catch (error) {
      console.error("Error adding to receiver's wallet:", error.message);
      return res.internalServerError({
        message: "Error processing receiver's wallet addition",
      });
    }

    // Log transaction for sender
    try {
      const senderWalletTrnResult = await senderWalletTrnResultIndb(
        transferMoneyData
      );
      console.log(senderWalletTrnResult, "senderWalletTrnResult");
      if (senderWalletTrnResult.status === 400) {
        return res.badRequest({ message: senderWalletTrnResult.data });
      }
    } catch (error) {
      console.error("Error logging sender's transaction:", error.message);
      return res.internalServerError({
        message: "Error logging sender's transaction",
      });
    }

    // Log transaction for receiver
    try {
      const receiverWalletTrnResult = await receiverWalletTrnResultIndb(
        transferMoneyData
      );
      if (receiverWalletTrnResult.status === 400) {
        return res.badRequest({ message: receiverWalletTrnResult.data });
      }
    } catch (error) {
      console.error("Error logging receiver's transaction:", error.message);
      return res.internalServerError({
        message: "Error logging receiver's transaction",
      });
    }

    //  emitEvent("fetchWalletBalance", { message: "New message sent" });
    emitEvent("fetchWalletBalance", { message: "Wallet balance updated." });
    emitEvent("fetchTransHistory", { message: "Transaction history updated." });

    return res.success({
      message: `${amount} transfer is successfully completed.`,
    });
  } catch (error) {
    // Catch any unexpected errors
    console.error("Unexpected error in transferWtWMoney:", error.message);
    return res.internalServerError({
      message: "Internal server error occurred",
    });
  }
};

const walletToBankTrns = async (req, res) => {
  const { userId, amount, ifsc, accountNumber, accountHolder, reference } =
    req.body;
  // console.log(req.body)
  //   if (
  //     !userId ||
  //     !amount ||
  //     !ifsc ||
  //     !accountNumber ||
  //     !accountHolder ||
  //     !reference
  //   ) {
  //     return res.status(400).json({
  //       message: "Missing required fields. Please provide all necessary details.",
  //     });
  //   }

  let validateRequest = validatewalletToBankTrns(req.body);
  if (!validateRequest.isValid) {
    return res.validationError({
      message: `Invalid values in parameters, ${validateRequest.message}`,
    });
  }

  try {
    // Fetch user's wallet balance from the database
    const getWalletBalance = await getUserBalanceInDb(userId);
    const userWalletBalance = getWalletBalance?.data[0]?.balance || null;

    // Check if the wallet balance is sufficient
    if (!userWalletBalance || userWalletBalance < amount) {
      return res.status(400).json({
        message: "Insufficient wallet balance or invalid user ID.",
      });
    }

    // Proceed with the bank transfer
    const transferResult = await processBankTransfer(
      amount,
      accountNumber,
      ifsc,
      accountHolder
    );
    if (transferResult.success) {
      // Deduct amount from wallet
      const deductResult = await deductResultIndb({
        amount: amount,
        sender_id: userId,
        amount: amount,
      }); // Update balance in DB
      if (deductResult.status !== 200) {
        return res.status(500).json({
          message: "Error while updating wallet balance.",
        });
      }
      // Log the transaction
      console.log(
        `Transferred ₹${amount} to bank account (${accountNumber}). Transaction ID: ${transferResult.transactionId}`
      );
      // Return success response
      emitEvent("fetchWalletBalance", { message: "Wallet balance updated." });

      return res.status(200).json({
        message: "Transfer successful.",
        transactionId: transferResult.transactionId,
        accountHolder,
        accountNumber,
        ifsc,
        amount,
        reference,
      });
    } else {
      return res.status(500).json({
        message: "Bank transfer failed. Please try again later.",
      });
    }
  } catch (error) {
    console.error("Error in walletToBankTrns:", error);
    return res.status(500).json({
      message: "An error occurred during the transfer process.",
      error: error.message,
    });
  }
};

// Mock Payment Gateway Function
// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET,
});

// Function to initiate the bank transfer using Razorpay Payouts
const processBankTransfer = async (
  amount,
  accountNumber,
  ifsc,
  accountHolder
) => {
  const transferDetails = {
    // Amount in paise (1 INR = 100 paise)
    amount: amount * 100, // Convert INR to paise

    // Bank account details
    bank_account: {
      account_number: accountNumber,
      ifsc: ifsc,
      account_holder_name: accountHolder,
    },

    // Optional: Add description or remarks (can be used for reference)
    description: `Transfer to bank account ${accountHolder}`,

    // Other optional details like reference, metadata, etc.
    reference_id: `txn_${Date.now()}`,
  };

  try {
    // Create the payout to the bank account using Razorpay API
    const payout = await razorpay.payouts.create(transferDetails);

    console.log(razorpay.payments.bankTransfer);
    return { success: true, transactionId: payout.id };
  } catch (error) {
    console.error("Error in Razorpay Payouts API:", error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  transferWtWMoney,
  walletToBankTrns,
};
