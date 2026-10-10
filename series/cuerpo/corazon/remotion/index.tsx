import React from "react";
import { registerRoot, Composition, CalculateMetadataFunction } from "remotion";
import { Corazon, Props } from "./Composition";
import timing from "./timing.json";

const calc: CalculateMetadataFunction<Props> = ({ props }) => ({ durationInFrames: Math.ceil(props.timing.duration * 30) });

registerRoot(() => (
  <Composition id="Corazon" component={Corazon} fps={30} width={1080} height={1920} durationInFrames={1215}
    defaultProps={{ timing: timing as any, dpr: 1, debug: false } as Props} calculateMetadata={calc} />
));
