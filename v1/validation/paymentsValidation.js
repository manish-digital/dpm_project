const Joi = require("joi");

const validateGetPayment = (requestData) => {
  const regSchema = Joi.object({
    amount: Joi.number().positive().required(),
    notes: Joi.alternatives().try(Joi.string(), Joi.object()).empty().allow(),
    currency: Joi.string().trim().required(),
    receipt: Joi.string().empty(),
    payment_capture: Joi.number().valid(0, 1).empty(),
    user_id: Joi.number().required(),
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

const validatePaymentWebhook = (requestData) => {
  const paymentSchema = Joi.object({
    razorpay_payment_id: Joi.string().pattern(/^pay_/).required().messages({
      "string.pattern.base":
        'Invalid Razorpay payment ID. It should start with "pay_".',
    }),

    razorpay_order_id: Joi.string()
      .pattern(/^order_/)
      .required()
      .messages({
        "string.pattern.base":
          'Invalid Razorpay order ID. It should start with "order_".',
      }),

    razorpay_signature: Joi.string()
      .length(64) // Razorpay signature length is typically 64 characters
      .required()
      .messages({
        "string.length": "Razorpay signature should be exactly 64 characters.",
      }),
  });

  const { error } = paymentSchema.validate(requestData, {
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

const validateGetWaletBalance = (requestData) => {
  const paymentSchema = Joi.object({
    user_id: Joi.number().required(),
  });
  const { error } = paymentSchema.validate(requestData, {
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

const validategetUserTransactionHistory = (requestData) => {
  const paymentSchema = Joi.object({
    user_id: Joi.number().required(),
  });

  const { error } = paymentSchema.validate(requestData, {
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
  validateGetPayment,
  validatePaymentWebhook,
  validateGetWaletBalance,
  validategetUserTransactionHistory,
};
