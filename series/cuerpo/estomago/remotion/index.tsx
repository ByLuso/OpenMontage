import React from "react";
import { registerRoot, Composition } from "remotion";
import { Estomago, Props } from "./Composition";
import timing from "./timing.json";

registerRoot(() => (
  <Composition id="Estomago" component={Estomago} fps={30} width={1080} height={1920} durationInFrames={1200}
    defaultProps={{ timing: timing as any, dpr: 1, debug: false } as Props} />
));
