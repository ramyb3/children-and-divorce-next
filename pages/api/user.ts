import { findSub, saveSub, signUp, updateSub } from "@/utils/dbFuncs";
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import connectMongo from "@/utils/dbConfig";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectMongo();

  if (req.body.method === "logorsign") {
    return await logOrSign(req, res);
  } else if (req.body.method === "completesign") {
    return await completeSign(req, res);
  } else if (req.body.method === "updatedate") {
    return await updateDate(req, res);
  }
}

const logOrSign = async (req: NextApiRequest, res: NextApiResponse) => {
  const obj = await findSub(req.body.email);
  const verification =
    obj?.verification || Math.floor(100000 + Math.random() * 900000);
  let message = "";

  if (!obj?.authorized) {
    //@ts-ignore
    const mailRes = await axios.post(process.env.NEXT_PUBLIC_MAIL, {
      email: req.body.email,
      verification,
      site: process.env.NEXT_PUBLIC_SITE,
    });

    if (!mailRes) {
      message = "חלה שגיאה ברישום, אנא נסו שוב";
    } else {
      if (!obj) {
        await saveSub(req.body.email, verification);
      }

      message =
        "ברגעים אלה נשלח אליכם מייל עם קוד אימות ורק לאחר מכן תוכלו להשתמש באתר";
    }
  }

  return res.json({
    authorized: obj?.authorized,
    message,
    firstFriday: obj?.firstFriday || "",
  });
};

const completeSign = async (req: NextApiRequest, res: NextApiResponse) => {
  const obj = await findSub(req.body.email);

  if (obj.verification === req.body.num) {
    await signUp(req.body.email);
    return res.status(200).json("");
  } else {
    return res.status(500).json("קוד האימות שגוי!");
  }
};

const updateDate = async (req: NextApiRequest, res: NextApiResponse) => {
  await updateSub(req.body);
  return res.json("");
};
