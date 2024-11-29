import React from "react";
import Scene from "./components/Scene";
import PageHome from "./ui/PageHome";
import Footer from "./components/footer";
import { motion } from "framer-motion";
import Header from "./components/header";
export default function Home() {
  return (
    <main className=" max-w-[100vw] overflow-x-hidden">
      <Header />
      <PageHome />

      <div
        className="relative z-[2] bg-transparent scroll-first-child flex flex-col justify-between"
        id="top"
      >
        <div className="mx-[80px] pt-[40px] flex items-center justify-between">
          <div>
            <p className="font-Silkscreen text-white">LOREM</p>{" "}
            <p className="font-Silkscreen text-white">| IPSUM</p>
          </div>
          <div className="uppercase text-white font-normal text-[12px] flex flex-col gap-2">
            <p>magni</p>
            <p>dolores</p>
            <p>ratione</p>
          </div>
          <div className="uppercase text-white font-normal text-[12px] flex flex-col gap-2">
            <p>magni</p>
            <p>dolores</p>
            <p>ratione</p>
          </div>
          <div className="uppercase text-white font-normal text-[12px] flex flex-col gap-2">
            <p>magni</p>
            <p>dolores</p>
            <p>ratione</p>
          </div>
          <div className=" size-14 rounded-full px-[10px] py-[20px] flex items-center flex-col justify-between">
            {/* <span className="h-[1px] w-3/4 bg-black"></span>
            <span className="h-[1px] w-3/4 bg-black "></span>
            <span className="h-[1px] w-3/4 bg-black"></span> */}
          </div>
        </div>
        <div className=" max-w-[100vw] pb-[40px] flex items-center justify-evenly text-white w-full">
          <div>
            <p className="font-bold text-[18px]">H. Rackham</p>
            <p className="opacity-80">architecto beatae</p>
          </div>
          <div>
            <p className="font-bold text-[18px]">H. Rackham</p>
            <p className="opacity-80">architecto beatae</p>
          </div>
          <div>
            <p className="font-bold text-[18px]">H. Rackham</p>
            <p className="opacity-80">architecto beatae</p>
          </div>
        </div>
      </div>
      <div className="relative z-[2] bg-transparent scroll-child flex items-center">
        <div className="mx-auto translate-x-1/2 w-[700px]">
          <p className="text-[48px] text-white opacity-100 uppercase font-extrabold">
            Ut enim ad minim veniam
          </p>
          <p className="text-white font-semibold mb-4">
            quis nostrud exercitation
          </p>
          <p className="text-white">
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem
            accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
            quae ab illo inventore veritatis et quasi architecto beatae vitae
            dicta sunt explicabo.
          </p>
        </div>
      </div>
      <div className="relative z-[2] bg-transparent scroll-child flex items-center">
        <div className="mx-auto -translate-x-1/2 w-[700px]">
          <p className="text-[48px] text-white opacity-100 uppercase font-extrabold">
            Ut enim ad minim veniam
          </p>
          <p className="text-white font-semibold mb-4">
            quis nostrud exercitation
          </p>
          <p className="text-white">
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem
            accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
            quae ab illo inventore veritatis et quasi architecto beatae vitae
            dicta sunt explicabo.
          </p>
        </div>
      </div>
      <div className="relative z-[2] bg-transparent scroll-child flex items-center">
        <div className="mx-auto translate-x-1/2 w-[700px]">
          <p className="text-[48px] text-white opacity-100 uppercase font-extrabold">
            Ut enim ad minim veniam
          </p>
          <p className="text-white font-semibold mb-4">
            quis nostrud exercitation
          </p>
          <p className="text-white">
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem
            accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
            quae ab illo inventore veritatis et quasi architecto beatae vitae
            dicta sunt explicabo.
          </p>
        </div>
      </div>
      {/* <div className="relative z-[2] bg-transparent scroll-child"></div> */}
      <Footer />
    </main>
  );
}
