import appConfig from "../config/appConfig.mjs";

const handleError = async (err, req, res, next) => {
   const statusCode = err.statusCode || 500;

   return res.status(statusCode).json({
      message: err.message,
      stack: appConfig.nodeEnv == "development" ? err.stack : "",
   });
};

export default handleError;
