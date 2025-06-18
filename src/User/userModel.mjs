import mongoose from "mongoose";

const userSchema = mongoose.Schema(
   {
      username: {
         type: String,
      },
      email: {
         type: String,
         unique: true,
      },
      password: {
         type: String,
         unique: true,
      },
   },
   { timestamps: true }
);

const User = mongoose.model("bloguser", userSchema);

export default User;
