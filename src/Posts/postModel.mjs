import mongoose from "mongoose";
import User from"../User/userModel.mjs"

const postSchema = new mongoose.Schema(
   {
      title: {
         type: String,
         required: true,
      },
      author: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "bloguser",         
         required: true,
      },

      postImg: {
         type: String,
         required: true,
      },
      body: {
         type: String,
         required: true,
      },
   },
   { timestamps: true }
);

const Posts = mongoose.model("Post", postSchema);

export default Posts;
