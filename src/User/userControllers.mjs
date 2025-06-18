import createHttpError from "http-errors";
import User from "./userModel.mjs";
import bcrypt from "bcrypt";

const registerUser = async (req, res, next) => {
   try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
         return next(createHttpError(400, "Please enter every information"));
      }

      if (username.length < 5 || password.length < 6) {
         return next(createHttpError(400, "please fullfill the criteria"));
      }

      const alreadyUser = await User.findOne({ email });

      if (alreadyUser) {
         return next(createHttpError(400, "Email already in use"));
      }

      const saltRounds = 10;
      const hashedPass = await bcrypt.hash(password, saltRounds);

      const newUser = await User.create({
         username,
         email,
         password: hashedPass,
      });

      req.session.user = newUser;

      return res.redirect("/");
   } catch (error) {
      console.log(error);
      return next(
         createHttpError(500, `there is some server Error:- ${error}`)
      );
   }
};

const logInUser = async (req, res, next) => {
   try {
      const { email, password } = req.body;
      if (!email || !password) {
         return next(createHttpError(400, "Please enter every information"));
      }

      const isUser = await User.findOne({ email });

      if (!isUser) {
         return next(createHttpError(401, "Invalid Email"));
      }

      const checkPass = await bcrypt.compare(password, isUser.password);

      if (!checkPass) {
         return next(createHttpError(401, "Invalid Password"));
      }

      req.session.user = isUser;
      return res.redirect("/");
   } catch (error) {
      console.log(`Server error Occuered: ${error}`);
      return next(createHttpError(500, error));
   }
};

const logoutUser = async (req, res, next) => {
   req.session.destroy((err) => {
      if (err) {
         console.error("Error destroying session:", err);
         return next(createHttpError(500, "Error logging out"));
      }
   });
   res.clearCookie("connect.sid");
   res.redirect("/");
};

export { registerUser, logInUser, logoutUser };
