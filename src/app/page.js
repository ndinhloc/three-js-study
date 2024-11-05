import Image from "next/image";
import Scene from "./components/Scene";
import dynamic from "next/dynamic";
const SceneNoSSR = dynamic(() => import("./components/Scene"));
export default function Home() {
  return (
    <main className="h-screen">
      {" "}
      <SceneNoSSR className="h-full"></SceneNoSSR>
    </main>
  );
}
