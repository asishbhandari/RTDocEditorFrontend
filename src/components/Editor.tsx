import { useEffect, useState } from "react";
import { socket } from "../socket/socket";
import { yDoc, yText } from "../yjs/yjsClient";
import * as Y from "yjs";

const docId = "doc1";

export default function Editor() {
  const [value, setValue] = useState("");

  useEffect(() => {
    socket.emit("join-document", docId);

    socket.on("load-document", (update: Uint8Array) => {
      Y.applyUpdate(yDoc, update);
      setValue(yText.toString());
    });

    socket.on("receive-update", (update: Uint8Array) => {
      Y.applyUpdate(yDoc, update);
    });

    yDoc.on("update", (update: Uint8Array) => {
      socket.emit("send-update", update);
    });

    yText.observe(() => {
      setValue(yText.toString());
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;

    // Replace content (temporary approach)
    yDoc.transact(() => {
      yText.delete(0, yText.length);
      yText.insert(0, newValue);
    });
  };

  return (
    <textarea
      value={value}
      onChange={handleChange}
      style={{ width: "100%", height: "300px" }}
    />
  );
}