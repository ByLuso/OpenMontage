import React from "react";
import { registerRoot, Composition, CalculateMetadataFunction } from "remotion";
import { Noche, Props } from "./Composition";
import timing from "./timing.json";

const calc: CalculateMetadataFunction<Props> = ({ props }) => ({ durationInFrames: Math.ceil(props.timing.duration * 30) });
registerRoot(() => (
  <Composition id="Noche" component={Noche} fps={30} width={1080} height={1920} durationInFrames={2280}
    defaultProps={{ timing: timing as any, dpr: 1 } as Props} calculateMetadata={calc} />
));
