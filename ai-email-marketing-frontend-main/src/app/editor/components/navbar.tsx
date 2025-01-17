'use client'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { useEditor } from "@craftjs/core";
import { Button } from '@/components/ui/button';
import lz from "lzutf8";
import { fetchSession, getImage, saveEmail } from '../actions';
import { toast } from 'sonner';
import { EditorSession } from '../../../../types/types';
import { useRouter } from 'next/navigation';
import { Loader2Icon } from 'lucide-react';
import { craftJsonToHtml } from '../lib/codeGen';
import Link from "next/link";

interface Navbar {
  session: EditorSession;
}

export default function Navbar({ session }: Navbar) {
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [imageCaptureLoading, setImageCaptureLoading] = useState<boolean>(false);
  const { actions, query, enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  const captureImage = async () => {
    setImageCaptureLoading(true);
    const json = query.serialize();
    const html = craftJsonToHtml(json);
    const base64Image = await getImage(html);
    if (base64Image) {
      // Convert Base64 to Blob
      const byteCharacters = atob(base64Image);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/png' });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'generated-image.png';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      setImageCaptureLoading(false);
    }
  };

  const handleSave = async () => {
    setSaveLoading(true);
    actions.selectNode(null!);
    const json = query.serialize();
    const encodedJson = lz.encodeBase64(lz.compress(json));
    const html = craftJsonToHtml(json);
    const updatedEmail = await saveEmail(encodedJson, session!, html);
    if (updatedEmail) {
      toast.success('Email Saved');
      setSaveLoading(false);
    } else {
      toast.error('There was an error saving this email');
      setSaveLoading(false);
    }
  };

  const exportHTML = () => {
    const json = query.serialize();
    const html = craftJsonToHtml(json);

    // Wrap the generated HTML inside the necessary divs with correct classes and styles
    const wrappedHtml = `
    <div class="flex justify-center items-center min-h-screen">
      <div style="width: 700px;
    height: 700px;"  class="w-[700px] mt-[70px] min-h-screen overflow-x-clip border shadow-2xl border-gray-300 text-black bg-white">
        <div class="h-full w-full" style="background: rgb(255, 255, 255); outline: none; min-height: 100vh; min-width: 100%;">
          ${html}
        </div>
      </div>
    </div>
    <style>
      body {
        font-family: Arial, sans-serif;
      }
      .w-full {
        width: 100%;
      }
      .h-full {
        height: 100%;
      }
      .min-h-screen {
        min-height: 100vh;
      }
      .flex {
        display: flex;
      }
      .justify-center {
        justify-content: center;
      }
      .items-center {
        align-items: center;
      }
      .w-[700px] {
        width: 700px;
      }
      .mt-[70px] {
        margin-top: 70px;
      }
      .overflow-x-clip {
        overflow-x: clip;
      }
      .border {
        border: 1px solid;
      }
      .shadow-2xl {
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      }
      .border-gray-300 {
        border-color: #D1D5DB;
      }
      .bg-white {
        background-color: #FFFFFF;
      }
    </style>
  `;

    // Create a Blob from the HTML string
    const blob = new Blob([wrappedHtml], { type: 'text/html' });

    // Create a download link for the HTML file
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template.html'; // Set the name for the downloaded file
    document.body.appendChild(a);
    a.click();

    // Clean up
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };


  return (
      <div className="flex items-center justify-between w-full fixed top-0 bg-zinc-900 h-[70px] z-10">
        <div className="flex items-center gap-1 text-lg font-semibold m-4">
          <Link href="/dashboard" passHref>
            <Image
                alt="logo"
                src={'/IMG_8769-removebg-preview (1).png'}
                width={40}
                height={40}
                style={{ cursor: 'pointer' }} // Optional: Change cursor to pointer
            />
          </Link>
          <Link href="/dashboard" passHref>
            <h1>MailSpark</h1>
          </Link>
        </div>
        <div>{session?.session_name}</div>
        <div className="mx-4 flex items-center gap-4">
          <h1 className="text-[10px] text-zinc-400">
            {session.email_saves.length !== 0
                ? `Last Saved: ${session.email_saves[session.email_saves.length - 1].updated_at}`
                : ''}
          </h1>
          <Button
              disabled={saveLoading}
              className="text-xs h-[25px] px-7"
              onClick={() => {
                handleSave();
              }}
          >
            {saveLoading ? <Loader2Icon className="animate-spin" /> : 'Save'}
          </Button>
          <Button onClick={() => captureImage()}>Download Image</Button>
          <Button onClick={exportHTML}>Download Code</Button> {/* Added button to download HTML */}
        </div>
      </div>
  );
}
