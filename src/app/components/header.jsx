"use client";
import React, { useEffect } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";

function Header() {
  const [open, setOpen] = React.useState(false);
  const [button, setButton] = React.useState(false);
  const mainRef = React.useRef();
  useEffect(() => {
    mainRef.current = document.querySelector("main");
    console.log(mainRef);
  }, []);
  const { scrollYProgress } = useScroll({ container: mainRef });
  const buttonOpacity = useTransform(scrollYProgress, [0.125, 0.25], [0, 100]);
  const buttonScale = useTransform(scrollYProgress, [0.125, 0.25], [0.75, 1]);
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest >= 0.25 && latest <= 0.75) setButton(true);
    else setButton(false);
  });

  return (
    <>
      <motion.div
        animate={open ? { translateY: "0%" } : { translateY: "-100%" }}
        transition={{ ease: "anticipate" }}
        className="px-[80px] pt-[40px] pb-[40px] flex items-center justify-between fixed top-0 left-0 bg-white w-[100vw] max-h-[20vh] z-[2]"
      >
        <div>
          <p className="font-Silkscreen">LOREM</p>
          <p className="font-Silkscreen">| IPSUM</p>
        </div>
        <div className="uppercase font-normal text-[12px] flex flex-col gap-2">
          <p>magni</p>
          <p>dolores</p>
          <p>ratione</p>
        </div>
        <div className="uppercase font-normal text-[12px] flex flex-col gap-2">
          <p>magni</p>
          <p>dolores</p>
          <p>ratione</p>
        </div>
        <div className="uppercase font-normal text-[12px] flex flex-col gap-2">
          <p>magni</p>
          <p>dolores</p>
          <p>ratione</p>
        </div>
        <div className=" size-14 rounded-full px-[10px] py-[20px] flex items-center flex-col justify-between"></div>
      </motion.div>

      <AnimatePresence>
        {button && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={
              open
                ? { opacity: 100, scale: 1, backgroundColor: "#000" }
                : { opacity: 100, scale: 1 }
            }
            exit={{ opacity: 0, scale: 0.8 }}
            className=" size-14 rounded-full px-[16px] py-[22px] flex items-center justify-between bg-white fixed z-[10] top-[40px] right-[80px]"
            onClick={() => setOpen(!open)}
          >
            <motion.div
              animate={
                open
                  ? {
                      translateX: "12px",
                      backgroundColor: "#fff",
                      rotate: "45deg",
                    }
                  : {}
              }
              transition={{ duration: 0.4 }}
              className="h-full bg-black w-[1px]"
            ></motion.div>
            <div className="flex h-full gap-[4px]">
              <motion.div
                animate={
                  open
                    ? {
                        translateX: "-9px",
                        backgroundColor: "#fff",
                        rotate: "-45deg",
                        opacity: 0,
                      }
                    : {}
                }
                transition={{ duration: 0.4 }}
                className="h-full bg-black w-[1px]"
              ></motion.div>
              <motion.div
                animate={
                  open
                    ? {
                        translateX: "-11px",
                        backgroundColor: "#fff",
                        rotate: "-45deg",
                      }
                    : {}
                }
                transition={{ duration: 0.4 }}
                className="h-full bg-black w-[1px]"
              ></motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Header;
