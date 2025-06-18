import { config } from "dotenv";
config();

const overAllConfig = {
   port: process.env.PORT,
   dbString: process.env.MONGO_CONNECTION_STRING,
   nodeEnv: process.env.NODE_ENV,
   cloudinaryName: process.env.CLOUDINARY_NAME,
   cloudinarySecret: process.env.CLOUDINARY_API_SECRET,
   cloudinaryKey: process.env.CLOUDINARY_API_KEY,
   sessionSignatureKey: process.env.SESSION_SECRET_FOR_SIGN,
};

const appConfig = Object.freeze(overAllConfig);

export default appConfig;
