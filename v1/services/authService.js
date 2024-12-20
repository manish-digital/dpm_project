const common = require("./common");
// const db = require("../../database/connection").promise();
// const {
//   getUserByEmailQuery
// } = require("../services/dbQueries");

const { isPasswordMatch, generateToken } = require("./common");
const {
  getAdminDetailsQuery,
  serchUserByEmailQuery,
  addServiceIndbQuery,
  addMerchantIndbQuery,
  serchMerchantByEmailQuery,
  serchAdminByEmailQuery,
  addAdminIndbQuery,
  getUserDetailsQuery,
} = require("./dbQueries");
const db = require("../../database/mysqlConnection").promise();

// const loginUser = async (email, password) => {
//   try {
//     const [user] = await db.execute(getAdminByEmailQuery, [email]);

//     const dataLength = user.length;
//     if (dataLength > 1) {
//       return {
//         status: 400,
//         data: "Multiple User Found",
//       };
//     }

//     const userData = user[0];

//     if (!user || dataLength == 0) {
//       return {
//         status: 400,
//         data: "User not exists",
//       };
//     }

//     if (password) {
//       const userPassword = userData.password;
//       let isPasswordMatched = await common.isPasswordMatch(
//         password,
//         userPassword
//       );

//       if (!isPasswordMatched) {
//         return {
//           status: 400,
//           data: "Incorrect Password",
//         };
//       }
//     }

//     let token;
//     token = await common.generateToken(userData, process.env.JWT_SECRET);

//     let userToReturn = {
//       token,
//     };

//     return {
//       data: userToReturn,
//     };
//   } catch (error) {
//     throw new Error(error.message);
//   }
// };

// const signUpUser = async (email, password) => {
//   try {
//     const [user] = await db.execute(getUserByEmailQuery, [email ]);

//     const dataLength = user.length;

//     if (dataLength > 1) {
//       return {
//         status: 400,
//         data: "Multiple User Found",
//       };
//     }

//     const userData = user[0];

//     if (!user || dataLength == 0) {
//       return {
//         status: 400,
//         data: "User not exists",
//       };
//     }

//     if (password) {
//       const userPassword = userData.password;
//       let isPasswordMatched = await common.isPasswordMatch(
//         password,
//         userPassword
//       );

//       if (!isPasswordMatched) {
//         return {
//           status: 400,
//           data: "Incorrect Password",
//         };
//       }
//     }

//     let token;
//     token = await common.generateToken(userData, process.env.JWT_SECRET);

//     let userToReturn = {
//       token,
//     };

//     return {
//       data: userToReturn,
//     };
//   } catch (error) {
//     throw new Error(error.message);
//   }
// };

const getUserDetails = async (emailORphone, password) => {
  try {
    const [user] = await db.execute(getUserDetailsQuery, [emailORphone , emailORphone]);
    const dataLength = user.length;
    if (dataLength > 1) {
      return {
        status: 400,
        data: "Multiple User Found",
      };
    }

    const userData = user[0];
    if (!user || dataLength == 0) {
      return {
        status: 400,
        data: "User not exists",
      };
    }

    if (password) {
      const userPassword = userData.password;
      let isPasswordMatched = await isPasswordMatch(password, userPassword);

      if (!isPasswordMatched) {
        return {
          status: 400,
          data: "Incorrect Password",
        };
      }
    }

    let token;
    token = await generateToken(userData, process.env.JWT_SECRET);

    let userToReturn = {
      token,
    };

    return {
      data: userToReturn,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

const searchUser = async (userData) => {
  try {
    // Assuming the query expects email and phone to be passed as separate parameters
    const [result] = await db.execute(serchUserByEmailQuery, [
      userData?.email,
      userData?.parsedPhone,
    ]);

    // Check if user already exists (result.length is checked for an array)
    if (result && result.length > 0) {
      return {
        status: 200,
        data: result[0], // Return the first matched result
      };
    } else {
      return {
        status: 400,
        data: "No existing user found.",
      };
    }
  } catch (error) {
    console.error("Error while checking if user exists:", error);
    throw new Error("Database error");
  }
};

const addUserIndb = async (userData) => {
  try {
    const [result] = await db.execute(addServiceIndbQuery, [
      userData.name,
      userData.email,
      userData.password,
      userData.phone,
      userData.dob,
      userData.role,
      userData.address,
      userData.kyc_verified,
      userData.generateReferCode || null ,
      userData?.status || 1,
    ]);

    let token;

    if(result?.insertId){
      userData["id"]=result.insertId || null ;
      token = await common.generateToken(userData, process.env.JWT_SECRET);
    }

    if (result.affectedRows > 0) {
      return {
        status: 200,
        data: {
          message: "User added successfully.",
          insertId: result.insertId,
          token: token,
        },
      };
    }

    return {
      status: 400,
      data: "Failed to insert user.",
    };
  } catch (error) {
    console.error("Error while checking if user exists:", error);
    throw new Error("Database error");
  }
};

// merchant data

const searchMerchant = async (merchantData) => {
  try {
    // Assuming the query expects email and phone to be passed as separate parameters
    const [result] = await db.execute(serchMerchantByEmailQuery, [
      merchantData.email,
      merchantData.phone,
    ]);

    // Check if user already exists (result.length is checked for an array)
    if (result && result.length > 0) {
      return {
        status: 200,
        data: result[0], // Return the first matched result
      };
    } else {
      return {
        status: 400,
        data: "No existing user found.",
      };
    }
  } catch (error) {
    console.error("Error while checking if user exists:", error);
    throw new Error("Database error");
  }
};

const addMerchantIndb = async (userData) => {
  try {
    // If dob is undefined or empty, set it to null (or default value)
 // Ensure no undefined values are passed; replace with null if necessary
 const dob = userData.dob || null;
 const name = userData.name || null;
 const email = userData.email || null;
 const password = userData.password || null;
 const phone = userData.phone || null;
 const address = userData.address || null;
 const business_name = userData.business_name || null;
 const business_type = userData.business_type || null;
 const gst_number = userData.gst_number || null;
 const business_address = userData.business_address || null;
 const business_phone = userData.business_phone || null;
 const kyc_document = userData.kyc_document || null;
 const bank_account_number = userData.bank_account_number || null;
 const bank_ifsc = userData.bank_ifsc || null;
 const pan_number = userData.pan_number || null;
 const role = userData.role || "merchant"; // Default to 'merchant' if not provided
 const operating_hours = userData.operating_hours || null;
 const status = userData.status || 1; // Default to 1 (active) if not provided

 // Execute the query with the sanitized data
 const [result] = await db.execute(addMerchantIndbQuery, [
   name, email, password, phone, dob, address, business_name, 
   business_type, gst_number, business_address, business_phone, 
   kyc_document, bank_account_number, bank_ifsc, pan_number, 
   role, operating_hours, status
 ]);

    


    
    if (result.affectedRows > 0) {
      return {
        status: 200,
        data: {
          message: "User added successfully.",
          insertId: result.insertId,
        },
      };
    }

    return {
      status: 400,
      data: "Failed to insert user.",
    };
  } catch (error) {
    console.error("Error while checking if user exists:", error);
    throw new Error("Database error");
  }
};

//adimin

const searchAdmin = async (adminData) => {
  try {
    console.log(adminData);
    // Assuming the query expects email and phone to be passed as separate parameters
    const [result] = await db.execute(serchAdminByEmailQuery, [
      adminData.email,
      adminData.phoneNumber,
    ]);

    // Check if user already exists (result.length is checked for an array)
    if (result && result.length > 0) {
      return {
        status: 200,
        data: result[0], // Return the first matched result
      };
    } else {
      return {
        status: 400,
        data: "No existing user found.",
      };
    }
  } catch (error) {
    console.error("Error while checking if user exists:", error);
    throw new Error("Database error");
  }
};

const addAdminToDb = async (userData) => {
  try {
    // {
    //   "fullName": "John Doe",
    //   "username": "johndoe_admin",
    //   "email": "johndoe@example.com",
    //   "phoneNumber": "1234567890",
    //   "password": "securePassword123",
    //   "role": "superadmin",
    //   "companyName": "Tech Innovations Ltd.",
    //   "address": "123 Tech Street, Silicon Valley",
    //   "verificationCode": "XYZ123",
    //   "termsAccepted": true
    // }

    // If dob is undefined or empty, set it to null (or default value)
    const dob = userData.dob || null;

    // Ensure all undefined values are replaced by null
    const cleanData = {
      fullName: userData.full_name || null,
      username: userData.username || null,
      email: userData.email || null,
      password: userData.password || null,
      phoneNumber: userData.phone_number || null,
      dob, // dob is already handled above
      address: userData.address || null,
      companyName: userData.company_name || null,
      verificationCode: userData.verification_code || null,
      role: userData.role || "admin", // Default to "admin"
      termsAccepted: userData.terms_accepted ? 1 : 0, // Convert boolean to 1 or 0
    };

    // Prepare the query for inserting admin data

    // Execute the query to insert the admin data
    const [result] = await db.execute(addAdminIndbQuery, [
      cleanData.fullName, // full_name
      cleanData.username, // username
      cleanData.email, // email
      cleanData.password, // password (hashed)
      cleanData.phoneNumber, // phone_number
      cleanData.dob, // dob (nullable)
      cleanData.address, // address
      cleanData.companyName, // company_name
      cleanData.verificationCode, // verification_code
      cleanData.role, // role (default to "admin")
      cleanData.termsAccepted, // terms_accepted (1/0)
      1, // status (active)
    ]);

    // If rows were affected, return success response
    if (result.affectedRows > 0) {
      return {
        status: 200,
        data: {
          message: "Admin added successfully.",
          insertId: result.insertId,
        },
      };
    }

    // If insertion failed, return failure response
    return {
      status: 400,
      data: "Failed to insert admin.",
    };
  } catch (error) {
    console.error("Error while adding admin to database:", error);
    throw new Error("Database error");
  }
};

module.exports = {
  getUserDetails,
  searchUser,
  addUserIndb,
  addMerchantIndb,
  searchMerchant,
  searchAdmin,
  searchAdmin,
  addAdminToDb,
};
