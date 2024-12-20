const Joi = require("joi");

const validatetransferWtWMoney = (requestData) => {
  const regSchema = Joi.object({
    amount: Joi.number().positive().required(),
    mobileNumber: Joi.number()
      .integer()
      .min(1000000000)
      .max(9999999999)
      .required()
      .messages({
        "number.min": "Mobile number should be 10 digit.",
        "number.max": "Mobile number should be 10 digit",
      }),
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



  const validatewalletToBankTrns = (requestData) => {
    const regSchema = Joi.object({
      accountHolder: Joi.string()
        .trim()
        .regex(/^[A-Z\s]+$/)
        .required()
        .messages({
          "string.base": "Account holder must be a string.",
          "string.pattern.base": "Account holder must contain only uppercase letters and spaces.",
          "string.empty": "Account holder is required.",
          "any.required": "Account holder is required.",
        }),
      accountNumber: Joi.string()
        .pattern(/^\d+$/)
        .length(11) // Assuming account number is always 11 digits
        .required()
        .messages({
          "string.base": "Account number must be a string of numbers.",
          "string.length": "Account number must be exactly 11 digits.",
          "string.pattern.base": "Account number must contain only digits.",
          "any.required": "Account number is required.",
        }),
      ifsc: Joi.string()
        .pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)
        .required()
        .messages({
          "string.base": "IFSC code must be a string.",
          "string.pattern.base": "IFSC code must follow the standard format (e.g., SBIN0032292).",
          "string.empty": "IFSC code is required.",
          "any.required": "IFSC code is required.",
        }),
      amount: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
          "number.base": "Amount must be a number.",
          "number.integer": "Amount must be an integer.",
          "number.positive": "Amount must be a positive value.",
          "any.required": "Amount is required.",
        }),
      reference: Joi.string()
        .trim()
        .required()
        .messages({
          "string.base": "Reference must be a string.",
          "string.empty": "Reference is required.",
          "any.required": "Reference is required.",
        }),
      userId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
          "number.base": "User ID must be a number.",
          "number.integer": "User ID must be an integer.",
          "number.positive": "User ID must be a positive value.",
          "any.required": "User ID is required.",
        }),
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
 







module.exports = {
  validatetransferWtWMoney,
  validatewalletToBankTrns
};
