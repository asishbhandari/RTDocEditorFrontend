import { useEffect, useRef } from "react";
import { socket } from "../socket/socket";
import { yDoc, yText } from "../yjs/yjsClient";
import Quill from "quill";
import { QuillBinding } from "y-quill";
import * as Y from "yjs";

const docId = "doc1";

export default function Editor() {
  const editorRef= useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // send event to join the doc
    if (!editorRef.current) return;
    const quill = new Quill(editorRef.current!, {
      theme: "snow",
    });
    // Bind Quill with Yjs
    new QuillBinding(yText, quill);

    const stateVector = Y.encodeStateVector(yDoc);
    socket.emit("join-document", {docId , stateVector});

    // send event to load the document
    socket.on("load-document", (update: Uint8Array) => {
      Y.applyUpdate(yDoc, update);
      // setValue(yText.toString());
    });

    // send events to receive the update
    socket.on("receive-update", (update: Uint8Array) => {
      Y.applyUpdate(yDoc, update);
    });

    yDoc.on("update", (update: Uint8Array) => {
      socket.emit("send-update", update);
    });

    // yText.observe(() => {
    //   setValue(yText.toString());
    // });

    return () => {
      socket.off("load-document");
      socket.off("receive-update");
    };
  }, []);

  // const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  //   const newValue = e.target.value;

  //   // Replace content (temporary approach)
  //   yDoc.transact(() => {
  //     yText.delete(0, yText.length);
  //     yText.insert(0, newValue);
  //   });
  // };

  return (
    // <textarea
    //   value={value}
    //   onChange={handleChange}
    //   style={{ width: "100%", height: "300px" }}
    // />
    <div ref={editorRef} style={{ height: "400px" }} />
  );
}