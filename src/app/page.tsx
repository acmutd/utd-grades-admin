"use client"
import { useRef } from "react";

export default function Home() {
  const fileInput = useRef<HTMLInputElement>(null);
  const uploadFile = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    const rawFileBuffer = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve(event.target!.result);
      }
      reader.onerror = (err) => {
        reject(err);
      }
      reader.readAsDataURL(fileInput.current?.files?.[0]!);
    })

    const response = await fetch("/api/upload", {
      method: "POST",
      body: JSON.stringify({
        buffer: rawFileBuffer as any
      }),
      headers: {
        'Content-Type': "application/json"
      }
    });
    const result = await response.json();
    alert(result.msg);
  }
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-between p-24"
    >
      <form className="flex flex-col gap-4">
        <label>
          <span>Upload a file</span>
          <input type="file" name="file" ref={fileInput} />
        </label>
        <button type="submit" onClick={uploadFile}>Submit</button>
      </form>
    </main>
  );

}
