import { useState } from "react";
import axios from "axios";
import Dialog from "@mui/material/Dialog";

export default function DateCalc({ data }: { data: any }) {
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState("");
  const [hebrewEvents, setHebrewEvents] = useState({ hebrew: "", events: [] });

  const calcFriday = async () => {
    if (!checkFriday()) {
      setHebrewEvents({ hebrew: "", events: [] });
      return;
    }

    const dates = date.split("-");
    const dateWithParent = new Date(data.firstFriday);
    let parsedDate = new Date(date);

    if (parsedDate >= dateWithParent) {
      for (let i = 0; ; i += 14) {
        parsedDate = new Date(date);
        parsedDate.setDate(parsedDate.getDate() - i);

        if (parsedDate <= dateWithParent) {
          alert(
            Date.parse(parsedDate.toDateString()) ===
              Date.parse(dateWithParent.toDateString())
              ? "התור שלך"
              : "התור של הגרוש/ה"
          );
          break;
        }
      }

      try {
        const resp = await axios.get(
          `https://www.hebcal.com/converter?cfg=json&gy=${dates[0]}&gm=${dates[1]}&gd=${dates[2]}&g2h=1`
        );

        setHebrewEvents({ hebrew: resp.data.hebrew, events: resp.data.events });
      } catch (e) {
        console.error(e);
      }
    } else {
      const first = new Date(data.firstFriday).toLocaleDateString("en-GB");
      alert(`יש תוצאות החל מ- ${first}`);
    }
  };

  const save = async () => {
    if (!checkFriday()) {
      return;
    }

    data.setFirstFriday(date);
    setLoading(true);

    try {
      await axios.post("/api/user", {
        email: data.email,
        date,
        method: "updatedate",
      });
    } catch (e) {
      alert("נסו שוב");
      console.error(e);
    }

    setLoading(false);
  };

  const checkFriday = () => {
    const day = new Date(date).getDay();

    if (day !== 5) {
      alert("בחר רק ימי שישי!");
    }

    return day === 5;
  };

  return (
    <>
      <Dialog open={data.firstFriday === ""} fullWidth>
        <div className="flex flex-col items-center gap-4 p-5">
          <span>בחר את יום השישי האחרון שלקחת את הילדים</span>
          <input type="date" onChange={(e) => setDate(e.target.value)} />
          <button onClick={save}>שמור</button>
          {loading && <h3>טוען...</h3>}
        </div>
      </Dialog>

      {data.firstFriday !== "" && (
        <div className="flex flex-col items-center gap-8 p-5">
          <h1>בחר תאריך:</h1>
          <input type="date" onChange={(e) => setDate(e.target.value)} />
          <button onClick={calcFriday}>בדוק</button>

          {hebrewEvents.hebrew && (
            <>
              <span>{hebrewEvents.hebrew}</span>
              <span className="underline">אירועים באותו תאריך:</span>
            </>
          )}

          <div className="flex flex-col items-center gap-2.5">
            {hebrewEvents.events.map((item, index) => {
              return <span key={index}>{item}</span>;
            })}
          </div>
        </div>
      )}
    </>
  );
}
