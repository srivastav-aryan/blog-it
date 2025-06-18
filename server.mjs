import appConfig from "./src/config/appConfig.mjs";
import connectDataBase from "./src/config/dbConfig.mjs";
import app from "./src/app.mjs";

const server = async function () {
   await connectDataBase();

   const port = appConfig.port || 5000;
   app.listen(port, () => console.log(`runing on the port ${port}`));
};

server();
