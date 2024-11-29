import NoiseGradient from "./NoiseGradient";
import Dispersion from "./Dispersion/Dispersion-study";

function LensScene({ imgList, ...props }) {
  return (
    <>
      <NoiseGradient />
      <Dispersion imgList={imgList}></Dispersion>
    </>
  );
}

export default LensScene;
