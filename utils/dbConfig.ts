import mongoose from "mongoose";

const connectMongo = async () => {
  //@ts-ignore
  mongoose.connect(process.env.NEXT_PUBLIC_MONGO);
};

export default connectMongo;
