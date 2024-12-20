// authController.js

const authService = require("../services/authService");
const { hashPassword } = require("../services/common");
const { createWalletInDb } = require("../services/getPaymentsServices");
const {
  validateAdminLogin,
  validateUserReg,
  validateMerchantReg,
  validateAdminReg,
  validateUserLogin,
} = require("../validation/authValidation");
const { v4: uuidv4 } = require("uuid");

// const login = async (req, res) => {
//   try {
//     console.log(req.body);
//     let { email, password } = req.body;
//     if (!email || !password) {
//       return res.badRequest({
//         message:
//           "Insufficient request parameters! email and password is required.",
//       });
//     }

//     // Trim whitespace from email and password
//     email = email.trim();
//     password = password.trim();

//     // if (email == "kai@gmail.com") {
//     //   return res.badRequest({
//     //     message:
//     //       "Please utilize your own provided email address for better monitoring of your work.",
//     //   });
//     // }

//     let validateRequest = validateLogin({ email: email, password: password });

//     if (!validateRequest.isValid) {
//       return res.validationError({
//         message: `Invalid values in parameters, ${validateRequest.message}`,
//       });
//     }

//     let result = await authService.loginUser(email, password);
//     if (result.status == 400) {
//       return res.badRequest({ message: result.data });
//     }
//     return res.success({
//       data: result.data,
//       message: "Login successful.",
//     });
//   } catch (error) {
//     return res.internalServerError({ message: error.message });
//   }
// };

// const signUp = async (req, res) => {
//   try {
//     let { email, password, confirmPassword } = req.body;

//     // Check if email and password are provided
//     if (!email || !password || !confirmPassword) {
//       return res.badRequest({
//         message:
//           "Insufficient request parameters! email, password, and confirmPassword are required.",
//       });
//     }

//     // Trim whitespace from email and password
//     email = email.trim();
//     password = password.trim();
//     confirmPassword = confirmPassword.trim();

//     // Validate email format and password (use your own validation logic here)
//     let validateRequest = validateUserRegister({
//       email: email,
//       password: password,
//       confirmPassword: confirmPassword,
//     });

//     if (!validateRequest.isValid) {
//       return res.validationError({
//         message: `Invalid values in parameters, ${validateRequest.message}`,
//       });
//     }

//     // Check if passwords match
//     if (password !== confirmPassword) {
//       return res.validationError({
//         message: "Passwords do not match.",
//       });
//     }

//     // Check if the email is already taken
//     let existingUser = await getUserByEmail(email);
//     if (existingUser) {
//       return res.badRequest({
//         message: "Email is already registered.",
//       });
//     }

//     // Hash the password before saving it to the database
//     const hashedPassword = await hashPassword(password);

//     // Create the user
//     const newUser = {
//       email: email,
//       password: hashedPassword,
//       status: 1, // Active status
//     };

//     let result = await createUser(newUser);
//     if (!result || result.status !== 'success') {
//       return res.badRequest({ message: "Failed to create user." });
//     }

//     // Optionally, send a verification email or take additional steps
//     return res.success({
//       data: result.data,
//       message: "Sign up successful. Please verify your email.",
//     });
//   } catch (error) {
//     console.error(error);
//     return res.internalServerError({
//       message: error.message,
//     });
//   }
// };

// const AdminLogin = async (req, res) => {
//   try {

//     // { email: 'manish@gmail.com', password: '1234Manish' }

//     console.log(req.body);
//     let { email, password } = req.body;
//     if (!email || !password) {
//       return res.badRequest({
//         message:
//           "Insufficient request parameters! email and password is required.",
//       });
//     }

//     // Trim whitespace from email and password
//     email = email.trim();
//     password = password.trim();

//     // if (email == "kai@gmail.com") {
//     //   return res.badRequest({
//     //     message:
//     //       "Please utilize your own provided email address for better monitoring of your work.",
//     //   });
//     // }
//     let validateRequest = validateAdminLogin({ email: email, password: password });

//     if (!validateRequest.isValid) {
//       return res.validationError({
//         message: `Invalid values in parameters, ${validateRequest.message}`,
//       });
//     }

//     let result = await authService.getAdminDetails(email, password);
//     if (result.status == 400) {
//       return res.badRequest({ message: result.data });
//     }
//     return res.success({
//       data: result.data,
//       message: "Login successful.",
//     });
//   } catch (error) {
//     return res.internalServerError({ message: error.message });
//   }
// };

// User Registration API

const UserRegister = async (req, res) => {
  try {
    req.body["role"] = "user";
    // Destructure the request body
    let {
      email,
      password,
      name,
      phone,
      dob,
      role,
      address,
      kyc_verified,
      refrel_code,
    } = req.body;
    console.log(refrel_code, "refrel_code");
    const parsedPhone = parseFloat(phone);

    req.body["phone"] = parsedPhone;
    // Validate request body using custom validation
    let validateRequest = validateUserReg(req.body);

    if (!validateRequest.isValid) {
      return res.validationError({
        message: `Invalid values in parameters: ${validateRequest.message}`,
      });
    }

    // Check if the user already exists by email or phone
    const existingUser = await authService.searchUser({ email, parsedPhone });
    if (existingUser.status === 200) {
      return res.badRequest({
        message: "Email or Phone Number is already registered.",
      });
    }

    // Hash the password before storing it in the database
    const hashedPassword = await hashPassword(password);

    // Function to generate a short UID
    const generateShortUID = () => {
      return uuidv4().slice(0, 8).toUpperCase(); // First 8 characters, uppercase
    };

    const generateReferCode = generateShortUID();
    // Create a new user instance
    const newUser = {
      email,
      password: hashedPassword,
      name,
      phone,
      dob,
      role,
      address,
      kyc_verified,
      generateReferCode: generateReferCode,
    };

    // Add the new user to the database (use a database service function)
    let result = await authService.addUserIndb(newUser);

    if (result.status === 400) {
      return res.badRequest({ message: result.data });
    }
    const user_id = result.data.insertId || 1;
    const userWalletCreate = await createWalletInDb(user_id);
    console.log(userWalletCreate, "usereWallet");
    if (userWalletCreate.status === 400) {
      return res.badRequest({
        message: "issue from created user wallet.",
      });
    }

    return res.success({
      message: "User registered successfully.",
      data: result.data, // Return the created user data
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.internalServerError({ message: error.message });
  }
};

const MerchantRegister = async (req, res) => {
  try {
    // Destructure the request body
    req.body["role"] = "merchant";

    let {
      email,
      password,
      name,
      phone,
      dob,
      role,
      address,
      kyc_verified,
      business_name,
      business_type,
      gst_number,
      business_address,
      business_phone,
      kyc_document,
      bank_account_number,
      bank_ifsc,
      pan_number,
      operating_hours,
    } = req.body;
    const parsedNo = parseInt(phone);
    req.body["phone"] = parsedNo;
    // {
    //   "name": "jophn",
    //   "email": "jophn@example.com",
    //   "password": "yourpassword123",
    //   "phone": 1234567890,  // Ensure no special characters
    //   "address": "123 Main Street, City, Country",
    //   "business_name": "Jophn Enterprises",
    //   "business_type": "Retail",
    //   "gst_number": "27ABCDE1234F1Z5",  // Correct GST number format (for India, adjust as needed)
    //   "business_address": "456 Business Street, City, Country",
    //   "business_phone": "9876543210",  // Business phone should be a string, so this is correct
    //   "kyc_document": "aGVsbG8gd29ybGQ=",  // Example base64 encoded string for the KYC document (replace with actual base64)
    //   "bank_account_number": "1234567890",
    //   "bank_ifsc": "BANK0001234",
    //   "pan_number": "ABCDE1234F",
    //   "role": "admin",
    //   "operating_hours": "9:00 AM - 6:00 PM"
    // }

    // Validate request body using custom validation
    let validateRequest = validateMerchantReg(req.body);

    if (!validateRequest.isValid) {
      return res.validationError({
        message: `Invalid values in parameters: ${validateRequest.message}`,
      });
    }
    console.log(validateRequest);
    // Check if the user already exists by email or phone
    const existingUser = await authService.searchMerchant({ email, phone });
    if (existingUser.status === 200) {
      return res.badRequest({
        message: "Email or Phone Number is already registered.",
      });
    }

    // Hash the password before storing it in the database
    const hashedPassword = await hashPassword(password); // Make sure hashPassword is implemented properly
    // Create a new user instance
    const newMerchant = {
      email,
      password: hashedPassword,
      name,
      phone,
      dob,
      role,
      address,
      kyc_verified,
      business_name,
      business_type,
      gst_number,
      business_address,
      business_phone,
      kyc_document,
      bank_account_number,
      bank_ifsc,
      pan_number,
      operating_hour: "9:00 AM - 6:00 PM",
      status: 1,
    };
    console.log(newMerchant);
    // Add the new user to the database (use a database service function)
    let result = await authService.addMerchantIndb(newMerchant);
    if (result.status === 400) {
      return res.badRequest({ message: result.data });
    }

    // Respond with success if user is created
    return res.success({
      message: "Merchant registered successfully.",
      data: result.data, // Return the created user data
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.internalServerError({
      message: "An error occurred while registering the merchant.",
    });
  }
};

// admin

const AdminRegister = async (req, res) => {
  try {
    // Destructure the request body
    let {
      fullName, // Renamed to match incoming data structure
      username, // Added username field
      email,
      phoneNumber, // Renamed phone field
      password,
      role,
      companyName, // Added company name field
      address,
      verificationCode, // Added verification code field
      termsAccepted, // Added terms accepted field
    } = req.body;

    // Validate request body using custom validation
    let validateRequest = validateAdminReg(req.body); // Assuming a validation function for admin registration

    if (!validateRequest.isValid) {
      return res.validationError({
        message: `Invalid values in parameters: ${validateRequest.message}`,
      });
    }

    // Check if the email or phone already exists
    const existingUser = await authService.searchAdmin({ email, phoneNumber });
    if (existingUser && existingUser.status === 200) {
      return res.badRequest({
        message: "Email or Phone Number is already registered.",
      });
    }

    // Hash the password before storing it in the database
    const hashedPassword = await hashPassword(password); // Make sure hashPassword is implemented properly

    // Create a new admin instance (with adjusted fields)
    const newAdmin = {
      full_name: fullName, // Store as `full_name`
      username, // Store as `username`
      email,
      password: hashedPassword,
      phone_number: phoneNumber, // Store as `phone_number`
      role, // Role (e.g., "superadmin")
      company_name: companyName, // Store company name
      address,
      verification_code: verificationCode, // Store verification code
      terms_accepted: termsAccepted, // Terms accepted (boolean)
      status: 1, // Assume `1` for active status
    };

    // Add the new admin to the database (use a database service function)
    let result = await authService.addAdminToDb(newAdmin); // Assuming `addAdminToDb` is implemented properly
    if (result.status === 400) {
      return res.badRequest({ message: result.data });
    }

    // Respond with success if user is created
    return res.success({
      message: "Admin registered successfully.",
      data: result.data, // Return the created admin data
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.internalServerError({
      message: "An error occurred while registering the admin.",
    });
  }
};

const logout = async (req, res) => {
  try {
    return res.success({ message: "Logged Out Successfully" });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

const UserLogin = async (req, res) => {
  try {
    //  "email": "user@example.com",
    //  "password":"Manish@123"

    console.log(req.body);
    let { emailORphone, password } = req.body;
    if (!emailORphone || !password) {
      return res.badRequest({
        message:
          "Insufficient request parameters! email and password is required.",
      });
    }

    // Trim whitespace from email and password
    emailORphone = emailORphone.trim();
    password = password.trim();

    // if (email == "kai@gmail.com") {
    //   return res.badRequest({
    //     message:
    //       "Please utilize your own provided email address for better monitoring of your work.",
    //   });
    // }
    let validateRequest = validateUserLogin({
      emailORphone: emailORphone,
      password: password,
    });

    if (!validateRequest.isValid) {
      return res.validationError({
        message: `Invalid values in parameters, ${validateRequest.message}`,
      });
    }
    let result = await authService.getUserDetails(emailORphone, password);
    console.log(result , "result")
    if (result.status == 400) {
      return res.badRequest({ message: result.data });
    }
    return res.success({
      data: result.data,
      message: "Login successful.",
    });
  } catch (error) {
    return res.internalServerError({ message: error.message });
  }
};

module.exports = { UserRegister, MerchantRegister, AdminRegister, UserLogin };
