"use client";
import React from "react";

import { motion, useScroll, useTransform } from "framer-motion";
function Footer() {
  const mainRef = React.useRef();
  React.useEffect(() => {
    mainRef.current = document.querySelector("main");
  }, []);
  const { scrollYProgress } = useScroll({ container: mainRef });
  const scrollTop = () => {
    mainRef.current.scroll({ top: 0, behavior: "smooth" });
  };
  return (
    <>
      <motion.div className="relative h-[100vh] bottom-0 left-0 bg-transparent w-[100vw] snap-end ">
        <div className="absolute h-[80vh] w-[100vw] px-[100px] pt-[100px] bg-black bottom-0 left-0 ">
          <div>
            <p className="text-white font-semibold text-[50px] uppercase">
              Neque porro quisquam
            </p>
            <p className="text-white font-semibold text-[50px] uppercase">
              qui dolorem ipsum.
            </p>
            <p className="text-white opacity-60 my-4">
              sed quia non numquam eius modi tempora incidunt ut labore <br />
              et dolore magnam aliquam quaerat voluptatem
            </p>
            <p className="text-white font-semibold text-[32px]">
              lorem@ipsum.com
            </p>
          </div>
          <motion.div
            initial={{
              borderColor: "#fff",
              backgroundColor: "#000",
              color: "#fff",
            }}
            whileHover={{
              borderColor: "#000",
              backgroundColor: "#fff",
              color: "#000",
              scale: 0.9,
            }}
            className="absolute size-20 bg-black border-[1px] border-white rounded-full bottom-[100px] right-[100px] flex items-center text-white justify-center z-[10] cursor-pointer origin-center"
            onClick={scrollTop}
          >
            <span className="text-[14px]">TOP</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="size-[18px]"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18"
              />
            </svg>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}

export default Footer;
