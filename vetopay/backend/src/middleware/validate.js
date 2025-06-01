const { AppError } = require('./errorHandler');

const validate = (schema) => {
  return async (req, res, next) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      const errorMessage = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      next(new AppError(JSON.stringify(errorMessage), 400));
    }
  };
};

module.exports = validate; 