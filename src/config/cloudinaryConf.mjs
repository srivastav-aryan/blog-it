import appConfig from "./appConfig.mjs";

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
   cloud_name: appConfig.cloudinaryName,
   api_key: appConfig.cloudinaryKey,
   api_secret: appConfig.cloudinarySecret,
});

export default cloudinary;
