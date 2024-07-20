'use client'

import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [pdf, setPdf] = useState<File | undefined>()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log(file)
    if (file) {
      setPdf(file);
    } else {
      setPdf(undefined);
      // Optionally, inform the user that no file was selected
      console.log('No file selected');
    }
  };

  const uploadFile = async ()=>{

    const formData = new FormData();
    formData.append('pdf', pdf as File)


    const response = await fetch('/api', {
      method: 'POST',
      body: formData,
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('PDF uploaded successfully:', result);
    } else {
      console.error('Failed to upload PDF');
    }

  }


  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div>
        
        hello there just testing things out

      </div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={uploadFile}>Execute function</button>
    </main>
  );
}
