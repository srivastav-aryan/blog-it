import createHttpError from "http-errors";
import cloudinary from "../config/cloudinaryConf.mjs";
import Posts from "./postModel.mjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const allowedType = {
   blogimg: ["image/jpeg", "image/png", "image/gif"],
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createPost = async (req, res, next) => {
   try {
      const { title, body } = req.body;

      if (!title || !body) {
         return next(createHttpError(400, "Please fill every filled"));
      }

      if (typeof title !== "string" || typeof body !== "string") {
         return next(createHttpError(400, "invalid data type"));
      }

      if (!req.file) {
         return next(createHttpError(400, "please provide the image"));
      }

      if (!allowedType.blogimg.includes(req.file.mimetype)) {
         return next(createHttpError(400, "Image format not support"));
      }
      const result = await cloudinary.uploader.upload(req.file.path, {
         folder: "post-pic-folder",
         filename_override: req.file.filename,
         format: req.file.mimetype.split("/").at(-1),
      });

      fs.unlink(
         path.resolve(
            __dirname,
            "../../public/data/uploads/",
            req.file.filename
         ),
         (err, d) => {
            if (err) return console.log(err);
         }
      );

      const postData = await Posts.create({
         title: title,
         body: body,
         author: req.session.user._id,
         postImg: result.secure_url,
      });

      return res.status(201).redirect("/");
   } catch (error) {
      console.log(error);
      return next(createHttpError(500, error));
   }
};

const updatePost = async (req, res, next) => {
   try {
      const { title, body } = req.body;
      const postId = req.params.postId;

      if (title !== undefined && title.trim() === "")
         return next(createHttpError(400, "title cannot be empty"));

      if (body !== undefined && body.trim() === "")
         return next(createHttpError(400, "body cannot be empty"));

      const post = await Posts.findOne({ _id: postId });

      if (!post) return next(createHttpError(400, "No such post available"));

      if (post.author.toString() !== req.session.user._id.toString())
         return next(createHttpError(403, "Unauthorized access!!"));

      if (req.file) {
         const image = req.file;
         const imageFormat = image.mimetype;

         if (!allowedType.blogimg.includes(imageFormat))
            return next(createHttpError(401, "File format not supported"));

         const result = await cloudinary.uploader.upload(image.path, {
            filename_override: image.filename,
            folder: "post-pic-folder",
            format: imageFormat.split("/").at(-1),
         });

         const newPost = await Posts.findOneAndUpdate(
            { _id: postId },
            {
               title,
               body,
               postImg: result.secure_url,
            },
            { new: true }
         );

         fs.promises.unlink(path.resolve(image.path));

         const postUrl = post.postImg;
         const postPublicId =
            postUrl.split("/").at(-2) +
            "/" +
            postUrl.split("/").at(-1).split(".").at(-2);

         await cloudinary.uploader.destroy(postPublicId);

         return res.status(200).redirect("/");
      }
   } catch (error) {
      console.log(`error occured while updating:- ${error}`);
      return next(createHttpError(500, `some server Error occured:- ${error}`));
   }
};

// added nested try catch to mimic response of transaction not roll back
const deletePost = async (req, res, next) => {
   try {
      const postId = req.params.postId;
      const post = await Posts.findOne({ _id: postId }).lean();

      if (!post) return next(createHttpError(404, "No such Post available"));

      if (post.author.toString() !== req.session.user._id.toString())
         return next(createHttpError(403, "You cannot delete others Post"));

      let cloudinaryResult = true;
      try {
         const postCloudinaryUrl = post.postImg;
         const postPublicId =
            postCloudinaryUrl.split("/").at(-2) +
            "/" +
            postCloudinaryUrl.split("/").at(-1).split(".").at(-2);

         const deletionResult = await cloudinary.uploader.destroy(postPublicId);

         if (
            deletionResult.result !== "ok" &&
            deletionResult.result !== "not found"
         ) {
            cloudinaryResult = false;
            console.error(
               "Error deleting image from Cloudinary:",
               deletionResult
            );
         }
      } catch (cloudinaryError) {
         console.error("Error interacting with Cloudinary:", cloudinaryError);
      }

      try {
         await Posts.deleteOne({ _id: postId });

         if (cloudinaryResult) {
            return res.status(204).redirect("/");
         } else {
            return next(
               createHttpError(
                  500,
                  "Post deleted from database, but image deletion from Cloudinary failed."
               )
            );
         }
      } catch (dbError) {
         console.error("Database error during post deletion:", dbError);
         return next(
            createHttpError(
               500,
               `Failed to delete post due to a database error: ${dbError.message}`
            )
         );
      }
   } catch (error) {
      console.log(`server error:--- ${error}`);
      return next(createHttpError(500, `some server error occured: ${error}`));
   }
};

const readAllPosts = async (req, res, next) => {
   try {
      const posts = await Posts.find().lean();
      res.status(200).json(posts);
   } catch (error) {
      console.error(`DB error occured while reading all books:-- ${error}`);
      return next(
         createHttpError(
            500,
            `DB error occured while reading all books:-- ${error}`
         )
      );
   }
};

//Add single book read
export { createPost, updatePost, deletePost, readAllPosts };
