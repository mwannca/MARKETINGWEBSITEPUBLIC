import React from 'react';
import MainSparkPage from './MainPage/MailSparkPage';
import SignIn from './auth/components/signIn';
import Footer from "@/app/Footer";

export default function Home() {
  return (
      <div>
    <main className="flex min-h-screen items-center justify-center">
        <MainSparkPage></MainSparkPage>
      {/*<SignIn />*/}
    </main>
    <Footer /> {/* Adding the footer here */}
      </div>
  );
}
