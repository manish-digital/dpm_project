const Joi = require("joi");



const validateUserLogin = (requestData) => {
  const loginSchema = Joi.object({
    emailORphone: Joi.string()
      .trim()
      .custom((value, helpers) => {
        // Check if the value is a valid phone number (10 digits)
        if (/^\d{10}$/.test(value)) {
          return value; // valid phone number, return as is
        }
        // Check if the value is a valid email address
        if (Joi.string().email().validate(value).error === undefined) {
          return value; // valid email, return as is
        }
        // If neither, return an error
        return helpers.message("Must be a valid email or phone number.");
      })
      .required()
      .messages({
        "any.required": "Email or phone number is required.",
      }),
    password: Joi.string().min(4).trim().required().messages({
      "string.min": "Password must be at least 4 characters.",
      "any.required": "Password is required.",
    }),
  });

  const { error } = loginSchema.validate(requestData, {
    abortEarly: false,
    convert: false,
  });

  if (error) {
    const message = error.details.map((el) => el.message).join("\n");
    return {
      isValid: false,
      message,
    };
  }

  return { isValid: true };
};

 


const validateUserReg = (requestData) => {
  const regSchema = Joi.object({
    email: Joi.string().email().trim().required(),
    password: Joi.string().min(6).trim().required(),
    // Validate name as a non-empty string
    name: Joi.string().trim().required(),
    // Validate phone as a string (you could use regex for phone number format validation)
    phone: Joi.number()
      .integer()
      .min(1000000000)
      .max(9999999999)
      .required()
      .messages({
        "number.min": "Mobile number should be 10 digit.",
        "number.max": "Mobile number should be 10 digit",
      }),

    // Validate address as a non-empty string
    address: Joi.string().trim().required(),

    // Validate kyc_verified as a boolean or a string that can be converted to a boolean
    kyc_verified: Joi.boolean().required(),
    // kyc_verified: Joi.string().required(),

    // Optional: Add additional fields like 'dob' and 'role' if needed
    dob: Joi.string().required(), // ISO 8601 date format for date of birth
    role: Joi.string().valid("user", "merchant", "admin").required(), // Restrict roles to specific values
    refrel_code: Joi.string()
    .pattern(/^[A-Z0-9]{8}$/)  // Matches 8 alphanumeric characters
    .required(),  // Ensure it's required
  });

  const { error } = regSchema.validate(requestData, {
    abortEarly: false,
    convert: false,
  });

  if (error) {
    const message = error.details.map((el) => el.message).join("\n");
    return {
      isValid: false,
      message,
    };
  }
  return { isValid: true };
};

 

const validateMerchantReg = (requestData) => {
  const regSchema = Joi.object({
    // Validate name as a non-empty string
    name: Joi.string().trim().required(),

    // Validate email as a valid email address
    email: Joi.string().email().trim().required(),

    // Validate password (minimum 6 characters)
    password: Joi.string().min(6).trim().required(),

    // Validate phone number (should be a 10-digit number)
    phone: Joi.number()
      .integer()
      .min(1000000000)
      .max(9999999999)
      .required()
      .messages({
        "number.min": "Mobile number should be 10 digits.",
        "number.max": "Mobile number should be 10 digits.",
      }),

    // Validate address as a non-empty string
    address: Joi.string().trim().required(),

    // Validate business_name as a non-empty string
    business_name: Joi.string().trim().required(),

    // Validate business_type (e.g., Retail, E-commerce, etc.)
    business_type: Joi.string()
      .valid("Retail", "Restaurant", "E-commerce", "Wholesale", "Services")
      .required(),

    // Validate GST number (optional, but if provided, must match format)
    gst_number: Joi.string()
      .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9]{1}[A-Z]{1}[0-9]{1}$/)
      .optional()
      .messages({
        "string.pattern.base": "Invalid GST number format.",
      }),

    // Validate business_address as a non-empty string
    business_address: Joi.string().trim().required(),

    // Validate business phone (optional, but must match the phone number format)
    business_phone: Joi.string()
      .regex(/^\+?[0-9]{10,15}$/)
      .optional()
      .messages({
        "string.pattern.base": "Invalid phone number format for business.",
      }),

    // Validate kyc_document as a base64 string (simulating file upload validation)
    kyc_document: Joi.string().trim().required(),
    // Validate bank_account_number as a string of numbers
    bank_account_number: Joi.string()
      .pattern(/^\d{10,20}$/)
      .required()
      .messages({
        "string.pattern.base": "Bank account number must be numeric.",
      }),

    // Validate bank_ifsc as a string (must be a valid IFSC code)
    bank_ifsc: Joi.string()
      .pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)
      .required()
      .messages({
        "string.pattern.base": "Invalid IFSC code format.",
      }),

    // Validate pan_number as a valid PAN format
    pan_number: Joi.string()
      .regex(/[A-Z]{5}[0-9]{4}[A-Z]{1}/)
      .optional()
      .messages({
        "string.pattern.base": "Invalid PAN number format.",
      }),

    // Validate role, should be either 'merchant' or other roles if needed
    role: Joi.string().valid("merchant", "user", "admin").required(),

    // Validate operating_hours (e.g., "9:00 AM - 6:00 PM")
    operating_hours: Joi.string()
      .pattern(/^\d{1,2}:\d{2} [APap][Mm] - \d{1,2}:\d{2} [APap][Mm]$/)
      .optional()
      .messages({
        "string.pattern.base":
          "Invalid operating hours format (e.g., '9:00 AM - 6:00 PM').",
      }),

    // Optional: Validate created_at (will be handled server-side)
    created_at: Joi.date().optional(),

     
    kyc_verified: Joi.boolean().optional().default(false), // Default to false if not provided
    dob: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)  // Updated pattern for yyyy-mm-dd format
    .optional()
    .default("1970-01-01"),
  });

  const { error } = regSchema.validate(requestData, {
    abortEarly: false, // to get all validation errors
    convert: false, // don't convert values
  });

  if (error) {
    const message = error.details.map((el) => el.message).join("\n");
    return {
      isValid: false,
      message,
    };
  }
  return { isValid: true };
};


const validateAdminReg = (requestData) => {
  const regSchema = Joi.object({
    // Validate fullName as a non-empty string
    fullName: Joi.string().trim().min(3).required().messages({
      "string.min": "Full name must be at least 3 characters long.",
      "string.empty": "Full name is required."
    }),

    // Validate username as a non-empty string
    username: Joi.string().trim().min(5).max(50).required().messages({
      "string.min": "Username must be at least 5 characters long.",
      "string.max": "Username must be at most 50 characters long.",
      "string.empty": "Username is required."
    }),

    // Validate email as a valid email address
    email: Joi.string().email().trim().required().messages({
      "string.email": "Email must be a valid email address.",
      "string.empty": "Email is required."
    }),

    // Validate phoneNumber (should be a 10-15 digit number with optional "+" sign)
    phoneNumber: Joi.string().regex(/^\+?[0-9]{10,15}$/).required().messages({
      "string.pattern.base": "Phone number should be a valid 10-15 digit number with an optional '+' sign.",
      "string.empty": "Phone number is required."
    }),

    // Validate password (at least 6 characters long)
    password: Joi.string().min(6).trim().required().messages({
      "string.min": "Password must be at least 6 characters long.",
      "string.empty": "Password is required."
    }),

    // Validate role (must be 'superadmin', 'admin', or other valid roles)
    role: Joi.string().valid("superadmin", "admin").required().messages({
      "string.valid": "Role must be either 'superadmin' or 'admin'.",
      "string.empty": "Role is required."
    }),

    // Validate companyName as a non-empty string
    companyName: Joi.string().trim().min(3).required().messages({
      "string.min": "Company name must be at least 3 characters long.",
      "string.empty": "Company name is required."
    }),

    // Validate address as a non-empty string
    address: Joi.string().trim().min(10).required().messages({
      "string.min": "Address must be at least 10 characters long.",
      "string.empty": "Address is required."
    }),

    // Validate verificationCode (non-empty string, could be alphanumeric)
    verificationCode: Joi.string().alphanum().min(6).required().messages({
      "string.alphanum": "Verification code must be alphanumeric.",
      "string.min": "Verification code must be at least 6 characters long.",
      "string.empty": "Verification code is required."
    }),

    // Validate termsAccepted as a boolean (must be true or false)
    termsAccepted: Joi.boolean().valid(true).required().messages({
      "any.only": "You must accept the terms and conditions.",
      "boolean.base": "Terms accepted must be a boolean value."
    })
  });

  // Perform validation
  const { error } = regSchema.validate(requestData, {
    abortEarly: false, // returns all validation errors
    convert: false,    // don't convert the data type
  });

  if (error) {
    const message = error.details.map((el) => el.message).join("\n");
    return {
      isValid: false,
      message,
    };
  }
  return { isValid: true };
};




module.exports = { validateUserLogin, validateUserReg, validateMerchantReg , validateAdminReg };
