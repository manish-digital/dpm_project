const {
  deductResultIndbQuery,
  addAmountResultIndbQuery,
  searchUserByphoneQuery,
  senderWalletTrnResultQuery,
  receiverWalletTrnResultQuery,
} = require("./dbQueries");

const db = require("../../database/mysqlConnection").promise();

const transferWtWMoneyInDb = async (transferData) => {
  try {
    const [result] = await db.execute(transferWtWMoneyQuery, [
      transferData.amount,
      transferData.phone,
      transferData.sender_id,
    ]);

    if (result.affectedRows === 1) {
      return {
        status: 200,
        data: result,
      };
    } else {
      return {
        status: 400,
        data: "User Wallet Data Insertion Failed",
      };
    }
  } catch (error) {
    console.log({
      message: error,
      FunctionName: "createWalletInDb",
      FileName: "getPaymentsServices",
    });
    throw new Error(error.message);
  }
};

// Function to deduct money from sender's wallet
const deductResultIndb = async (transferData) => {
  try {
    if (transferData.id) {
      // Check if sender and receiver are the same person
      const serchUserByPhone = await getUserIdsearchByPhone(transferData);
      if (serchUserByPhone.id === transferData.sender_id) {
        return {
          status: 400,
          data: "Sender and receiver cannot be the same person. Please do not send money to yourself.",
        };
      }
    }

    // Deduct amount from sender's wallet
    const [result] = await db.execute(deductResultIndbQuery, [
      transferData.amount,
      transferData.sender_id,
      transferData.amount,
    ]);
    if (result.affectedRows === 0) {
      return {
        status: 400,
        data: "Insufficient funds or invalid sender ID.",
      };
    }

    if (result.affectedRows === 1) {
      return {
        status: 200,
        data: {
          message: "Amount deducted successfully.",
          result,
        },
      };
    }

    return {
      status: 400,
      data: "Failed to deduct money from the user wallet. Please try again.",
    };
  } catch (error) {
    console.error({
      message: error.message,
      function: "deductResultIndb",
      file: "walletServices",
      transferData,
    });
    throw new Error(`Error in deductResultIndb: ${error.message}`);
  }
};

// Function to search for user by phone number
const getUserIdsearchByPhone = async (transferData) => {
  try {
    // Step 1: Search for the user by phone
    const [serchUserByPhoneResult] = await db.execute(searchUserByphoneQuery, [
      transferData?.phone,
    ]);

    if (!serchUserByPhoneResult || serchUserByPhoneResult.length === 0) {
      return {
        status: 404,
        data: "Receiver with the provided phone number not found.",
      };
    }

    return serchUserByPhoneResult[0]; // Return the first user found
  } catch (error) {
    console.error({
      message: error.message,
      function: "getUserIdsearchByPhone",
      file: "walletServices",
      transferData,
    });
    throw new Error(`Error in getUserIdsearchByPhone: ${error.message}`);
  }
};

const addAmountResultIndb = async (transferData) => {
  try {
    // Step 1: Search for the user by phone
    // const [serchUserByPhoneResult] = await db.execute(searchUserByphoneQuery, [
    //   transferData?.phone,
    // ]);

    // if (!serchUserByPhoneResult || serchUserByPhoneResult.length === 0) {
    //   return {
    //     status: 404,
    //     data: "Receiver with the provided phone number not found.",
    //   };
    // }

    // const serchUserByPhone = serchUserByPhoneResult[0];
    const serchUserByPhone = await getUserIdsearchByPhone(transferData);
    if (serchUserByPhone.status === 404) {
      return {
        status: 400,
        data: "Sender Number is not found & not register digital pay money app. Please do not send money to yourself.",
      };
    }
    // Step 2: Add the amount to the user's wallet

    const [result] = await db.execute(addAmountResultIndbQuery, [
      transferData.amount,
      serchUserByPhone.id,
    ]);

    if (result.affectedRows === 0) {
      return {
        status: 400,
        data: "Failed to add amount to the receiver's wallet or invalid receiver ID.",
      };
    }

    if (result.affectedRows === 1) {
      return {
        status: 200,
        data: {
          message: "Amount added to receiver's wallet successfully.",
          result,
        },
      };
    }

    return {
      status: 400,
      data: "Unexpected error occurred while adding the amount. Please try again.",
    };
  } catch (error) {
    console.error({
      message: error.message,
      FunctionName: "addAmountResultIndb",
      FileName: "walletServices",
      transferData,
    });
    throw new Error(error.message);
  }
};

const senderWalletTrnResultIndb = async (transferData) => {
  try {
    const transaction_id = `TXN-${Date.now()}`; // Unique transaction ID
    // Step 1: Add the amount to the user's wallet

    const [result] = await db.execute(senderWalletTrnResultQuery, [
      transferData.sender_id,
      transaction_id,
      transferData.amount,
    ]);
    if (result.affectedRows === 0) {
      return {
        status: 400,
        data: " Failed to add amount history transaction .",
      };
    }

    if (result.affectedRows === 1) {
      return {
        status: 200,
        data: {
          message: "Add amount history transaction wallet successfully.",
          result,
        },
      };
    }

    return {
      status: 400,
      data: "Unexpected error occurred while adding the amount history . Please try again.",
    };
  } catch (error) {
    console.error({
      message: error.message,
      FunctionName: "senderWalletTrnResultIndb",
      FileName: "walletServices",
      transferData,
    });
    throw new Error(error.message);
  }
};

const receiverWalletTrnResultIndb = async (transferData) => {
  try {
    // Step 1: Search for the user by phone
    const [serchUserByPhoneResult] = await db.execute(searchUserByphoneQuery, [
      transferData?.phone,
    ]);
    if (!serchUserByPhoneResult || serchUserByPhoneResult.length === 0) {
      return {
        status: 400,
        data: "Receiver with the provided phone number not found.",
      };
    }

    const serchUserByPhone = serchUserByPhoneResult[0];

    const transaction_id = `TXN-${Date.now()}`; // Unique transaction ID
    // Step 1: Add the amount to the user's wallet
    const [result] = await db.execute(receiverWalletTrnResultQuery, [
      serchUserByPhone.id,
      transaction_id,
      transferData.amount,
    ]);

    if (result.affectedRows === 0) {
      return {
        status: 400,
        data: " Failed to Add receiver amount history transaction .",
      };
    }

    if (result.affectedRows === 1) {
      return {
        status: 200,
        data: {
          message:
            "Add Receiver amount history transaction wallet successfully.",
          result,
        },
      };
    }

    return {
      status: 400,
      data: "Unexpected error occurred while Add receiving the amount history . Please try again.",
    };
  } catch (error) {
    console.error({
      message: error.message,
      FunctionName: "receiverWalletTrnResultIndb",
      FileName: "walletServices",
      transferData,
    });
    throw new Error(error.message);
  }
};

module.exports = {
  transferWtWMoneyInDb,
  deductResultIndb,
  addAmountResultIndb,
  senderWalletTrnResultIndb,
  receiverWalletTrnResultIndb,
};
