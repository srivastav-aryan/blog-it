import express from "express";
import expressEjsLayouts from "express-ejs-layouts";
import path from "node:path";
import { fileURLToPath } from "url";
import router from "./User/userRoutes.mjs";
import handleError from "./middlewares/globalErrorHandler.mjs";
import postrouter from "./Posts/postRouter.mjs";
import session from "express-session";
import MongoStore from "connect-mongo";
import appConfig from "./config/appConfig.mjs";
import "./User/userModel.mjs";
import Posts from "./Posts/postModel.mjs";
import AuthenticateUser from "./middlewares/AuthUser.mjs";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import methodOverride from "method-override";
import createHttpError from "http-errors";

const app = express();
app.use(methodOverride("_method"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(expressEjsLayouts);
app.set("layout", "layouts/main");
app.use(express.static(path.resolve(__dirname, "../public")));
app.use(
   session({
      secret: appConfig.sessionSignatureKey,
      resave: false,
      saveUninitialized: false,
      httpOnly: true,
      cookie: {
         maxAge: 1000 * 60 * 60 * 24,
      },
      store: MongoStore.create({
         mongoUrl: appConfig.dbString,
         dbName: "blog-app",
      }),
   })
);

// User Api endpoints
app.use("/api/users", router);

//POST API ENDPPOINT
app.use("/api/posts", postrouter);

// ROUTES FOR SENDING HTML PAGES
app.get("/", async (req, res, next) => {
   try {
      const user = req.session.user || null;

      const blogs = await Posts.find({})
         .sort({ createdAt: -1 })
         .populate("author", "username")
         .lean();

      const blogsWithPreview = blogs.map((blog) => ({
         ...blog,
         preview: blog.body.slice(0, 150) + "...",
      }));

      res.render("home", { user, blogsWithPreview });
   } catch (error) {
      console.log(error);
   }
});

app.get("/register", (req, res, next) => {
   res.render("register", { user: null });
});

app.get("/login", (req, res, next) => {
   res.render("login", { user: null });
});

app.get("/create-post", AuthenticateUser, (req, res, next) => {
   const user = req.session.user || null;

   res.render("newPost", { user });
});

app.get("/edit-post/:postId", AuthenticateUser, async (req, res, next) => {
   const user = req.session.user || null;
   const postId = req.params.postId;

   const post = await Posts.findOne({ _id: postId }).lean();

   if (!post) return next(createHttpError(404, "No such post available"));

   res.render("editPost", { user, post });
});

app.get("/post/:postId", async (req, res, next) => {
   const postId = req.params.postId;
   const user = req.session.user || null;

   const post = await Posts.findOne({ _id: postId }).lean();

   if (!post) return next(createHttpError(404, "No such post available"));

   res.render("readPost", { user, post });
});

// global error middleware
app.use(handleError);

export default app;
