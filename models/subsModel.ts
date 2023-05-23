import { Schema, model, models } from "mongoose";

const userSchema = new Schema({
  email: String,
  authorized: Boolean,
  firstFriday: String,
  verification: Number,
});

const User = models.User || model("subs", userSchema);

export default User;
