const { default: axios } = require("axios");
const jwt = require("jsonwebtoken");

// Create JWT
const createJWT = () => {
  const SECRET_KEY = process.env.sprint_JWT_key; // Replace with your actual secret key

  const timestamp = () => Math.floor(Date.now() / 1000);
  const randomNumber = () => Math.floor(Math.random() * 1000000).toString();

  const payload = {
    timestamp: timestamp(),
    partnerId: "PS00988",
    reqid: randomNumber(),
  };
  const options = {
    algorithm: "HS256",
  };

  return jwt.sign(payload, SECRET_KEY, options);
};

// API Endpoints
const getoperatorName = async (req, res) => {
  try {
    const token = createJWT();
    const options = {
      method: "POST",
      url: "https://sit.paysprint.in/service-api/api/v1/service/recharge/recharge/getoperator",
      headers: {
        accept: "application/json",
        Token: token,
        "Content-Type": "application/json",
        Authorisedkey: process.env.sprint_Authorisedkey,
      },
    };

    const response = await axios.request(options);
    return res.success({
      success: true,
      message: "Operator name retrieved successfully.",
      data: response.data,
    });
  } catch (error) {
    console.error({
      message: error.message,
      functionName: "getoperatorName",
      fileName: "rechargeController",
      stack: error.stack,
      response: error.response ? error.response.data : null,
    });
    return res.internalServerError({
      message: error.response?.data?.message || "Failed to retrieve operator name.",
    });
  }
};

const postmobileRecharge = async (req, res) => {
  try {
    const { operatorId, phoneNumber, amount } = req.body;
console.log(operatorId, phoneNumber, amount , "operatorId, phoneNumber, amount")
    if (!operatorId || !phoneNumber || !amount) {
      return res.badRequest({
        message: "Missing required fields: operatorId, phoneNumber, or amount.",
      });
    }
    const token = createJWT();
    const options = {
      method: "POST",
      url: "https://sit.paysprint.in/service-api/api/v1/service/recharge/recharge/dorecharge",
      headers: {
        accept: "application/json",
        Token: token,
        "Content-Type": "application/json",
        Authorisedkey: process.env.sprint_Authorisedkey,
      },
      data: {
        operator: operatorId,
        canumber: phoneNumber,
        amount: amount,
        referenceid: "12345621895",
      },
    };

    const response = await axios.request(options);

    return res.success({
      success: true,
      message: "Mobile recharge completed successfully.",
      data: response.data,
    });
  } catch (error) {
    console.error({
      message: error.message,
      functionName: "mobileRechargeDetails",
      fileName: "rechargeController",
      stack: error.stack,
      response: error.response ? error.response.data : null,
    });
    return res.internalServerError({
      message: error.response?.data?.message || "Failed to complete mobile recharge.",
    });
  }
};

const getOperatorOrCircleData = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
console.log(phoneNumber , "phoneNumber")
    if (!phoneNumber) {
      return res.badRequest({
        message: "Missing required field: phoneNumber.",
      });
    }

    const token = createJWT();
    const options = {
      method: "POST",
      url: "https://sit.paysprint.in/service-api/api/v1/service/recharge/hlrapi/hlrcheck",
      headers: {
        accept: "application/json",
        Token: token,
        "Content-Type": "application/json",
        Authorisedkey: process.env.sprint_Authorisedkey,
      },
      data: { number: phoneNumber, type: "mobile" },
    };

    const response = await axios.request(options);

    return res.success({
      success: true,
      message: "Operator and circle data retrieved successfully.",
      data: response.data,
    });
  } catch (error) {
    console.error({
      message: error.message,
      functionName: "getOperatorOrCircleData",
      fileName: "rechargeController",
      stack: error.stack,
      response: error.response ? error.response.data : null,
    });
    return res.internalServerError({
      message: error.response?.data?.message || "Failed to retrieve operator or circle data.",
    });
  }
};

const getBrowserPlan = async (req, res) => {
  try {
    const { circle, op } = req.body;
console.log( circle, op  , "circle, op ")
    if (!circle || !op) {
      return res.badRequest({
        message: "Missing required fields: circle or op.",
      });
    }

    const token = createJWT();
    const options = {
      method: "POST",
      url: "https://sit.paysprint.in/service-api/api/v1/service/recharge/hlrapi/browseplan",
      headers: {
        accept: "application/json",
        Token: token,
        "Content-Type": "application/json",
        Authorisedkey: process.env.sprint_Authorisedkey,
      },
      data: { circle: circle, op: op },
    };

    const response = await axios.request(options);

    return res.success({
      success: true,
      message: "Browser plans retrieved successfully.",
      data: response.data,
    });
  } catch (error) {
    console.error({
      message: error.message,
      functionName: "getBrowserPlan",
      fileName: "rechargeController",
      stack: error.stack,
      response: error.response ? error.response.data : null,
    });
    return res.internalServerError({
      message: error.response?.data?.message || "Failed to retrieve browser plans.",
    });
  }
};

module.exports = {
  getoperatorName,
  postmobileRecharge,
  getOperatorOrCircleData,
  getBrowserPlan,
};
