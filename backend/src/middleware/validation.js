import Joi from 'joi';

export const validateRequest = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], { abortEarly: false, stripUnknown: true });
    if (error) {
      const errors = error.details.map(d => ({ field: d.path.join('.'), message: d.message }));
      return res.status(400).json({ errors });
    }
    req[property] = value;
    next();
  };
};

export const schemas = {
  createOrderSchema: Joi.object({
    items: Joi.array().items(Joi.object({ product_id: Joi.number().integer().required(), quantity: Joi.number().positive().required(), unit_price: Joi.number().positive().required(), seller_id: Joi.number().integer().required() })).min(1).required(),
    delivery_address: Joi.string().max(1000).required(),
    delivery_notes: Joi.string().max(500).allow('', null),
  }),
  initiatePaymentSchema: Joi.object({ orderId: Joi.number().integer().required(), phoneNumber: Joi.string().required() }),
  updateOrderStatusSchema: Joi.object({ status: Joi.string().valid('processing','shipped','delivered','completed','cancelled').required() }),
};
