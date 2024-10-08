// src\app\mail\page.tsx
import React from "react";
import Image from "next/image";
import logo from "@/public/EVOFIX.png";
const mail = () => {
  return (
    <>
      <div>
        <span className="flex">
          <h1 className="mr-4">مرحبا بكم في منصتنا الخدمية EvoFix</h1>
          <Image src={logo} alt="logo" width={40} height={40} />
        </span>
      </div>
      <h1>سيد محمد</h1>
      <p>لقد تم تفعيل حسابك بنجاح</p>
    </>
  );
};

export default mail;
