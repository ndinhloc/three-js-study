"use client";
import { useState, useEffect } from "react";
// import useDomToCanvas from "../../utils/useDomToCanvas";
import { debounce } from "lodash";
import dynamic from "next/dynamic";
import html2canvas from "html2canvas";
import * as THREE from "three";
import { useScroll } from "framer-motion";
const SceneNoSSR = dynamic(() => import("../components/Scene"));

const imgList = ["/test.jpg", "/test2.jpg", "/test3.jpg"];
function PageHome() {
  return (
    <>
      <div className="h-[100vh] w-[100vw] fixed top-0 left-0 z-[0] ">
        <SceneNoSSR className="h-full" imgList={imgList}></SceneNoSSR>
      </div>
      <style jsx global>{`
        .scroll-item {
          scroll-snap-align: center;
          scroll-snap-stop: always;
        }
      `}</style>
    </>
  );
}

export default PageHome;
