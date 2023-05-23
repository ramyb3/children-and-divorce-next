import User from "@/models/subsModel";

export const findSub = async (email: any) => {
  return await User.findOne({ email: email.trim() });
};

export const saveSub = async (email: any, verification: any) => {
  return new Promise((resolve, reject) => {
    const subs = new User({
      email,
      verification,
      authorized: false,
      firstFriday: "",
    });

    subs
      .save()
      .then((data: any) => resolve(data))
      .catch((err: any) => reject(err));
  });
};

export const signUp = async (email: any) => {
  return await User.findOneAndUpdate(
    { email },
    {
      authorized: true,
      verification: null,
    }
  );
};

export const updateSub = async (obj: any) => {
  return await User.findOneAndUpdate(
    { email: obj.email },
    {
      firstFriday: obj.date,
    }
  );
};
