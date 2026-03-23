import dotenv from "dotenv/config.js"
import connectDB from "./db/index.js";
import app from "./app.js";
import { error, log } from "node:console";

// dotenv.config({
//     path: "./.env"
// })

const PORT = Number(process.env.PORT) || 5000;

connectDB().then(()=>{
    app.listen(PORT, ()=>{
        console.log(`Server running on PORT ${PORT}`);
    });
})
.catch((error) =>{
    console.error("Database connection failed:", error);
})
