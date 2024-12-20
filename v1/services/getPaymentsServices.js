const {
  updateWalletBalanceQuery,
  updateWalletTransTypeQuery,
  AddWalletTransQuery,
  getTransDetailsQuery,
  getUserBalanceQuery,
  getUserTransHistoryQuery,
  userWalleteCreate,
} = require("./dbQueries");

const db = require("../../database/mysqlConnection").promise();

// const updateWalletBalanceInDb = async(paymentAmount)=>{
// const result = db.execute(updateWalletBalanceQuery , [paymentAmount])
// }

const updateWalletInDb = async (paymentAmount, user_id) => {
  try {
    console.log(paymentAmount, user_id);
    const [result] = await db.execute(updateWalletBalanceQuery, [
      paymentAmount,
      user_id,
    ]);
    if (result.affectedRows === 1) {
      return {
        status: 200,
        data: result,
      };
    } else {
      return {
        status: 400,
        data: "Wallet Update Data Insertion Failed",
      };
    }
  } catch (error) {
    console.log({
      message: error,
      FunctionName: "updateWallet",
      FileName: "getPaymentsServices",
    });
    throw new Error(error.message);
  }
};

const updateWalletTransTypeInDb = async (razorpay_order_id) => {
  try {
    const [result] = await db.execute(updateWalletTransTypeQuery, [
      razorpay_order_id,
    ]);

    if (result.affectedRows === 1) {
      return {
        status: 200,
        data: result,
      };
    } else {
      return {
        status: 400,
        data: "Wallet Update Data Insertion Failed",
      };
    }
  } catch (error) {
    console.log({
      message: error,
      FunctionName: "updateWallet",
      FileName: "getPaymentsServices",
    });
    throw new Error(error.message);
  }
};

const addTransHistory = async (transData) => {
  try {
    const [result] = await db.execute(AddWalletTransQuery, [
      transData.user_id,
      transData.transaction_id,
      transData.type,
      transData.amount,
      transData?.status || "pending",
    ]);

    if (result.affectedRows === 1) {
      return {
        status: 200,
        data: result,
      };
    } else {
      return {
        status: 400,
        data: "transaction History Update Data Insertion Failed",
      };
    }
  } catch (error) {
    console.log({
      message: error,
      FunctionName: "addWalletHistory",
      FileName: "getPaymentsServices",
    });
    throw new Error(error.message);
  }
};

const getTransDetails = async (razorpay_order_id) => {
  try {
    const [result] = await db.execute(getTransDetailsQuery, [
      razorpay_order_id,
    ]);
    if (result.length === 0) {
      return {
        status: 409,
        data: "No data found",
      };
    }

    return {
      status: 200,
      data: result,
    };
  } catch (error) {
    console.log({
      message: error,
      FunctionName: "getTransHistory",
      FileName: "getPaymentsServices",
    });
    throw new Error(error.message);
  }
};

const getUserBalanceInDb = async (user_id) => {
  try {
    console.log(user_id);
    const [result] = await db.execute(getUserBalanceQuery, [user_id]);
    if (result.length === 0) {
      return {
        status: 409,
        data: "No data found",
      };
    }
    return {
      status: 200,
      data: result,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const getUserTransHistoryInDb = async (user_id) => {
  try {
    const [result] = await db.execute(getUserTransHistoryQuery, [user_id]);
    if (result.length === 0) {
      return {
        status: 409,
        data: null,
      };
    } else {
      return {
        status: 200,
        data: result,
      };
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

const createWalletInDb = async (user_id) => {
  try {
    const [result] = await db.execute(userWalleteCreate, [user_id]);

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

module.exports = {
  updateWalletInDb,
  updateWalletTransTypeInDb,
  addTransHistory,
  getTransDetails,
  getUserBalanceInDb,
  getUserTransHistoryInDb,
  createWalletInDb,
};
