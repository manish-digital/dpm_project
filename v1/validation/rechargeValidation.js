const Joi = require("joi");

const validateMobileRecharge = (requestData) => {
  const mobieRechargeSchema = Joi.object({
    amount: Joi.string()
      .pattern(/^\d+(\.\d{1,2})?$/) // Allow decimal values with up to two decimal places
      .required()
      .messages({
        "string.base": "Amount must be a string.",
        "string.pattern.base": "Amount must be a valid number with up to two decimal places.",
        "string.empty": "Amount is required.",
        "any.required": "Amount is required.",
      }),
    operator: Joi.string()
      .trim()
      .required()
      .messages({
        "string.base": "Operator must be a string.",
        "string.empty": "Operator is required.",
        "any.required": "Operator is required.",
      }),
    phoneNumber: Joi.string()
      .pattern(/^\d{10}$/) // Validate as a 10-digit phone number
      .required()
      .messages({
        "string.base": "Phone number must be a string of digits.",
        "string.pattern.base": "Phone number must be exactly 10 digits.",
        "string.empty": "Phone number is required.",
        "any.required": "Phone number is required.",
      }),
  });

  const { error } = mobieRechargeSchema.validate(requestData, {
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


const validatepostmobileRecharge = (requestData) => {
  const mobieRechargeSchema = Joi.object({
    amount: Joi.string()
      .pattern(/^\d+(\.\d{1,2})?$/) // Allow decimal values with up to two decimal places
      .required()
      .messages({
        "string.base": "Amount must be a string.",
        "string.pattern.base": "Amount must be a valid number with up to two decimal places.",
        "string.empty": "Amount is required.",
        "any.required": "Amount is required.",
      }),
    operatorId: Joi.number(2)
      .trim()
      .required()
      .messages({
        "string.base": "OperatorId must be a number.",
        "string.empty": "OperatorId is required.",
        "any.required": "OperatorId is required.",
      }),
    phoneNumber: Joi.string()
      .pattern(/^\d{10}$/) // Validate as a 10-digit phone number
      .required()
      .messages({
        "string.base": "Phone number must be a string of digits.",
        "string.pattern.base": "Phone number must be exactly 10 digits.",
        "string.empty": "Phone number is required.",
        "any.required": "Phone number is required.",
      }),
  });

  const { error } = mobieRechargeSchema.validate(requestData, {
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


const validategetOperatorOrCircleData = (requestData) => {
  const mobieRechargeSchema = Joi.object({
    phoneNumber: Joi.string()
      .pattern(/^\d{10}$/) // Validate as a 10-digit phone number
      .required()
      .messages({
        "string.base": "Phone number must be a string of digits.",
        "string.pattern.base": "Phone number must be exactly 10 digits.",
        "string.empty": "Phone number is required.",
        "any.required": "Phone number is required.",
      }),
  });

  const { error } = mobieRechargeSchema.validate(requestData, {
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

const validateGetBrowserPlan = (requestData) => {
  const browserPlanSchema = Joi.object({
    circle: Joi.string()
      .min(3) // Minimum length for descriptive strings
      .required()
      .messages({
        "string.base": "Circle must be a string.",
        "string.empty": "Circle is required.",
        "string.min": "Circle must be at least 3 characters long.",
        "any.required": "Circle is required.",
      }),
    op: Joi.string()
      .min(3) // Minimum length for descriptive strings
      .required()
      .messages({
        "string.base": "Operator must be a string.",
        "string.empty": "Operator is required.",
        "string.min": "Operator must be at least 3 characters long.",
        "any.required": "Operator is required.",
      }),
  });

  const { error } = browserPlanSchema.validate(requestData, {
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
  validateMobileRecharge,
  validatepostmobileRecharge ,
  validategetOperatorOrCircleData ,
  validateGetBrowserPlan
};
