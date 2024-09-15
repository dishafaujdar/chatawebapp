"use client";

import { useState } from "react";
import { useSocket } from "../context/socketProvider";
import classes from "./page.module.css";

export default function page() {

  const { sendMessage , messages} = useSocket();
  const [message , setmessage] = useState('');

  return (
    <div>
      <div>
        <input onChange={e => setmessage(e.target.value)} className={classes["chat-input"]} placeholder="text here..."></input>
        <button onClick={e => sendMessage(message)}  className={classes["button"]} >send</button>
      </div>
      <div>
        {messages.map((e)=>(
        <li>{e}</li>
        ))}
      </div>
    </div>
  );
}
