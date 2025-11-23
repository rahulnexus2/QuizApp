import Mongoose from 'mongoose';

import config from './config.js';


const conectDb=async ()=>{
  Mongoose.connection.on("connected",()=>{
    console.log("Connected to MongoDb Database...")
  });

  await Mongoose.connect(`${config.mongoURI}`)
}

export default conectDb;