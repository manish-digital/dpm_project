const { default: axios } = require("axios");
const jwt = require("jsonwebtoken");
const { validatepostmobileRecharge, validategetOperatorOrCircleData, validateGetBrowserPlan } = require("../validation/rechargeValidation");
const RechargeBaseUrl = process.env.sprint_baseUrl
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
      url: `${RechargeBaseUrl}/recharge/recharge/getoperator`,
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

    let validateRequest = validatepostmobileRecharge(req.body);

    if (!validateRequest.isValid) {
      return res.validationError({
        message: `Invalid values in parameters, ${validateRequest.message}`,
      });
    }


    const token = createJWT();
    const options = {
      method: "POST",
      url: `${RechargeBaseUrl}/recharge/recharge/dorecharge`,
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
 
    if (!phoneNumber) {
      return res.badRequest({
        message: "Missing required field: phoneNumber.",
      });
    }
    let validateRequest = validategetOperatorOrCircleData(req.body);

    if (!validateRequest.isValid) {
      return res.validationError({
        message: `Invalid values in parameters, ${validateRequest.message}`,
      });
    }

    const token = createJWT();
    const options = {
      method: "POST",
      url: `${RechargeBaseUrl}/recharge/hlrapi/hlrcheck`,
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

    let validateRequest = validateGetBrowserPlan(req.body);

    if (!validateRequest.isValid) {
      return res.validationError({
        message: `Invalid values in parameters, ${validateRequest.message}`,
      });
    }

    const token = createJWT();
    const options = {
      method: "POST",
      url: `${RechargeBaseUrl}/recharge/hlrapi/browseplan`,
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
