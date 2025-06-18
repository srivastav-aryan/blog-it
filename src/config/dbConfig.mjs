import mongoose from "mongoose";
import appConfig from "./appConfig.mjs";

const connectDataBase = async () => {
   try {
      mongoose.connection.on("connected", () => {
         console.log("Database connected successfully");
      });

      mongoose.connection.on("error", (err) => {
         console.log(`error event occured in DataBase connection: ${err}`);
      });

      await mongoose.connect(appConfig.dbString);
   } catch (error) {
      console.log("Db connection failed", error);
      process.exit(1);
   }
};

export default connectDataBase;
