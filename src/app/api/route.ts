import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAuth } from "google-auth-library";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { NextRequest, NextResponse } from "next/server";
import pdf from "pdf-parse"

const key = JSON.parse(process.env.PRIVATE_KEY!);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const auth = new GoogleAuth({
  credentials: key,
  scopes: [
    "https://www.googleapis.com/auth/cloud-platform",
    "https://www.googleapis.com/auth/generative-language.retriever",
  ],
});

async function createCorpus() {
  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();
  const url = "https://generativelanguage.googleapis.com/v1beta/corpora";

  const body = {
    displayName: "Google for Dev Blog",
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Created corpus:", data);
    return data;
  } catch (error) {
    console.error("Error creating corpus:", error);
    throw error;
  }
}

async function viewCorpus(){
  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();
  const url =`https://generativelanguage.googleapis.com/v1beta/${process.env.CORPUS_NAME}`;
  console.log(url)

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken.token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log(response)

    const data = await response.json();
    console.log(" corpus data: ", data);
    return data;
  } catch (error) {
    console.error("Error creating corpus:", error);
    throw error;
  }



}


async function readPDF(buffer:any) {
  try {
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw error;
  }
}
async function chunkText(text:any) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 8000,  // Approximately 2000 tokens
    chunkOverlap: 200,
  });
  return await splitter.createDocuments([text]);
}

async function uploaChunkToDocument(chunks:any) {
  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();
  
  const documentPath = process.env.DOCUMENT_NAME; // Should be like "corpora/{corpus_id}/documents/{document_id}"


  const requests = chunks.map((chunk:any, index:number) => ({
    parent: `${process.env.DOCUMENT_NAME}`,
    chunk: {
      data: {
        stringValue: chunk.pageContent
      },
      customMetadata: [
        {
          key: "source",
          stringValue: "PDF_Upload"
        },
        {
          key: "chunkIndex",
          stringValue: `${index + 1}`
        }
      ]
    }
  }));
  
  const body = { requests };
  
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/${process.env.DOCUMENT_NAME}/chunks:batchCreate`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
  
    const data = await response.json();
    console.log('Chunks created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating chunks:', error);
    throw error;
  }

}

async function createDocumentInCorpus(){
  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();
  const url = `https://generativelanguage.googleapis.com/v1beta/${process.env.DOCUMENT_NAME}:query`;

  const body = {
    displayName:"justatest",

  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Created document:", data);
    return data;
  } catch (error) {
    console.error("Error creating corpus:", error);
    throw error;
  }
}


async function queryCorpus() {
  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();
  const url = `https://generativelanguage.googleapis.com/v1beta/${process.env.CORPUS_NAME}:query`;

  const body = {
    query: "What is IET?",
    resultsCount: 10 // Optional, defaults to 10 if not specified
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data)
    console.log("Result:", data);
    return data;
  } catch (error) {
    console.error("Error querying corpus:", error);
    throw error;
  }
}

async function getDocumentInfo() {
  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();
  const url = `https://generativelanguage.googleapis.com/v1beta/${process.env.CORPUS_NAME}/documents`;



  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken.token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data)
    console.log("Result:", data);
    return data;
  } catch (error) {
    console.error("Error querying corpus:", error);
    throw error;
  }
}

async function getChunkInfo() {
  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();
  const url = `https://generativelanguage.googleapis.com/v1beta/${process.env.DOCUMENT_NAME}/chunks`;



  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken.token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data)
    console.log("Result:", data);
    return data;
  } catch (error) {
    console.error("Error querying corpus:", error);
    throw error;
  }
}

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    console.log("trying here")
    const formData = await req.formData();
    console.log(formData)
    const file = formData.get('pdf') as File;

    console.log(file)
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Read file as ArrayBuffer and convert to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log(buffer) 

    // Read and chunk the PDF

    const pdfText = await readPDF(buffer);
    const chunks = await chunkText(pdfText);
 
    console.log(chunks)

    // Upload chunks to corpus
    // const result = await uploaChunkToDocument(chunks);

    getChunkInfo()

    return NextResponse.json("result", { status: 200 });
  } catch (error) {
    console.error('Error uploading PDF:', error);
    return NextResponse.json({ error: 'Failed to upload PDF' }, { status: 500 });
  }

}