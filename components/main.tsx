import { Dialog } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import DateCalc from "./date-calc";

export default function MainPage() {
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [verification, setVerification] = useState(false);
  const [num, setNum] = useState<number | undefined>(undefined);
  const [firstFriday, setFirstFriday] = useState("");
  const [email, setEmail] = useState("");
  const [mailText, setMailText] = useState<MailTemplate | null>(null);

  useEffect(() => {
    const mail = async () => {
      const resp = await getUserAgent();

      if (resp) {
        setMailText(resp);
        sendMail(resp, "Site Enter");
      }
    };

    mail();
  }, []);

  const login = async () => {
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      alert("אנא הזן כתובת מייל תקינה!");
      setEmail("");
      return;
    }

    setLoading(true);

    try {
      const resp = await axios.post("/api/user", {
        email,
        method: "logorsign",
      });

      if (!resp.data.authorized) {
        setVerification(true);
        alert(resp.data.message);

        await sendMail(mailText, `First Sign- ${email}`);
      } else {
        setVerification(false);
        setAuthorized(true);
        setFirstFriday(resp.data.firstFriday);
        setOpen(false);

        await sendMail(mailText, `Logged in- ${email}`);
      }
    } catch (e) {
      alert("נסו שוב");
      console.error(e);
    }

    setLoading(false);
  };

  const checkVerification = async () => {
    setLoading(true);

    try {
      await axios.post("/api/user", { email, num, method: "completesign" });

      setVerification(false);
      setAuthorized(true);
      setOpen(false);

      await sendMail(mailText, `Complete Sign Up- ${email}`);
    } catch (e: any) {
      setNum(undefined);
      alert(e.response.data);
    }

    setLoading(false);
  };

  return (
    <>
      <Dialog open={open} fullScreen>
        <h1>הילדים איתי או עם הגרוש/ה בסופ"ש?</h1>
        <div className="flex flex-col items-center gap-4 p-5 mt-[10%]">
          <input
            value={verification ? num : email}
            placeholder={
              verification ? "נא להזין את קוד האימות" : "נא להזין אימייל"
            }
            type={verification ? "number" : "email"}
            onChange={(e: any) => {
              if (verification) {
                setNum(parseInt(e.target.value));
              } else {
                setEmail(e.target.value);
              }
            }}
          />
          <button
            onClick={() => {
              if (verification) {
                checkVerification();
              } else {
                login();
              }
            }}
          >
            כניסה / הרשמה לאתר
          </button>

          {loading && <h3>טוען...</h3>}
        </div>
      </Dialog>

      {authorized && !verification && (
        <DateCalc data={{ firstFriday, email, setFirstFriday }} />
      )}
    </>
  );
}

type MailTemplate = {
  resolution: string;
  response: string;
  name: string;
};

async function getUserAgent() {
  let body = null;

  try {
    const response = await axios.get(
      `https://api.apicagent.com/?ua=${navigator.userAgent}`
    );

    body = {
      resolution: `${window.screen.width} X ${window.screen.height}`,
      response: JSON.stringify(response.data, null, 2),
      name: "Children-Divorce NextJS",
    };
  } catch (e) {
    console.error(e);
  }

  return body;
}

async function sendMail(mailText: MailTemplate | null, text: string) {
  try {
    //@ts-ignore
    await axios.post(process.env.NEXT_PUBLIC_MAIL, { ...mailText, text });
  } catch (e) {
    console.error(e);
  }
}
