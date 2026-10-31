const { error } = require('../utils/response');

/**
 * Validates request body/query/params against a Joi schema.
 * Usage: validate(schema, 'body')
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error: validationError, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (validationError) {
      const details = validationError.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message.replace(/"/g, ''),
      }));

      return error(res, 400, 'VALIDATION_ERROR', 'Validation failed.', details);
    }

    // Replace with sanitized/coerced values
    req[property] = value;
    next();
  };
};

module.exports = { validate };
