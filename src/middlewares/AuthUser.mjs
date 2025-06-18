import createHttpError from "http-errors";

const AuthenticateUser = async (req, res, next) => {
   if (!req.session.user) {
      return next(
         createHttpError(
            401,
            "You need to log in or create an account to access this page"
         )
      );
   }
   return next();
};

export default AuthenticateUser;
