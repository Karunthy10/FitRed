import { Composition } from "remotion";
import { KiloPromo } from "./KiloPromo";

// Promo vertical de Kilo (9:16, ~14 s a 30 fps)
export const MyComposition = () => {
  return (
    <Composition
      id="KiloPromo"
      component={KiloPromo}
      durationInFrames={420}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
