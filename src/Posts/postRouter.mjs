import express from "express";
import {
   createPost,
   deletePost,
   readAllPosts,
   updatePost,
} from "./postController.mjs";
import multer from "multer";
import path from "node:path";
import { fileURLToPath } from "node:url";
import AuthUser from "../middlewares/AuthUser.mjs";

const postrouter = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const upload = multer({
   dest: path.resolve(__dirname, "../../public/data/uploads"),
   limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

postrouter.post("/", AuthUser, upload.single("blogimg"), createPost);

postrouter.patch("/:postId", AuthUser, upload.single("blogimg"), updatePost);

postrouter.delete("/:postId", AuthUser, deletePost);

postrouter.get("/", readAllPosts);

export default postrouter;
