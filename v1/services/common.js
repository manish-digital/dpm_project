const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { parsePhoneNumber } = require('libphonenumber-js');
// let {
//   getAllCountryQuery,
//   getStateByCountryQuery,
//   getCitiesByStateQuery,
//   getEmployeeListQuery,
//   getCatalogStatusQuery,
//   getLocationIdQuery,
// } = require("../Services/dbQueries");
const db = require("../../database/mysqlConnection").promise();

const generateToken = async (user, secret) => {
  let roles;

  if (user.role == "user" ) {
    roles = ["user"];
  }
  if (user.role == "merchant" ) {
    roles = ["merchant"];
  }
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email:user.email,
      phone:user.phone,
      userType: user.user_type ,
      roles: roles,
      refrelCode : user.refer_code ,
      status: user.status,
    },
    secret
    // { expiresIn: process.env.JWT_EXPIRES_IN * 60 }
  );
};

const hashPassword = async function (password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};
const isPasswordMatch = async function (password, userPassword) {
  return bcrypt.compare(password, userPassword);
};

const toJSON = (userData) => {
  let values = Object.assign({}, userData);
  delete values.password;
  return values;
};

async function randomNumber(length = 8) {
  const numbers = "1234567890"; // Use only 0-9 to ensure numeric output
  let result = ""; // Initialize result as an empty string
  for (let i = length; i > 0; i -= 1) {
    result += numbers[Math.floor(Math.random() * numbers.length)]; // Use Math.floor to ensure index is an integer
  }
  return result;
}

const extractMobileNumber = (mobile) => {
  try {
    const phoneNumber = parsePhoneNumber(mobile);
    return {
      countryCode: phoneNumber.countryCallingCode,
      phoneNumber: phoneNumber.nationalNumber
    };
  } catch (error) {
    // If parsing fails, return the original number
    console.error('Error parsing phone number:', error.message);
    return {
      countryCode: null,
      phoneNumber: mobile
    };
  }
};


function convertObjectToEnum(obj) {
  const enumArr = [];
  Object.values(obj).map((val) => enumArr.push(val));
  return enumArr;
}

const getCatalogSetting = async () => {
  try {
    const [result] = await db.execute(getCatalogStatusQuery, [1]);

    if (result.length === 0) {
      return {
        status: 409,
        data: "No data found",
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
const getAllCountry = async () => {
  try {
    const [result] = await db.execute(getAllCountryQuery);

    if (result.length === 0) {
      return {
        status: 409,
        data: "No data found",
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

const getStateList = async (countryId) => {
  try {
    const [result] = await db.execute(getStateByCountryQuery, [countryId]);

    if (result.length === 0) {
      return {
        status: 409,
        data: "No data found",
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

const getCitiesList = async (countryId) => {
  try {
    const [result] = await db.execute(getCitiesByStateQuery, [countryId]);

    if (result.length === 0) {
      return {
        status: 409,
        data: "No data found",
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

const getLocationId = async (countryISO = null, state = null, city = null) => {
  try {

    let params = [countryISO];
    let getLocationIdQueryEdited = getLocationIdQuery;

    if (state !== null) {
      getLocationIdQueryEdited += "\nAND states.name = ?";
      params.push(state);
    } else {
      // If state is not provided, exclude it from the response
      getLocationIdQueryEdited = getLocationIdQueryEdited.replace(
        /states\.id AS stateId/g,
        "NULL AS stateId"
      );
    }

    if (city !== null) {
      getLocationIdQueryEdited += "\nAND cities.name = ?";
      params.push(city);
    } else {
      // If city is not provided, exclude it from the response
      getLocationIdQueryEdited = getLocationIdQueryEdited.replace(
        /cities\.id AS cityId/g,
        "NULL AS cityId"
      );
    }

    // If both state and city are not provided, select only countryId
    if (state === null && city === null) {
      getLocationIdQueryEdited =
        "SELECT countries.id AS countryId FROM countries WHERE countries.iso2 = ?";
    }

    const [result] = await db.execute(getLocationIdQueryEdited, params);
  

    if (result.length === 0) {
      return {
        status: 409,
        data: "No data found",
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

module.exports = {
  generateToken,
  isPasswordMatch,
  toJSON,
  hashPassword,
  randomNumber,
  getAllCountry,
  getStateList,
  getCitiesList,
  extractMobileNumber,
  getLocationId,
};
