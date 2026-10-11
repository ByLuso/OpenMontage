import React from "react";
import { registerRoot, Composition, CalculateMetadataFunction } from "remotion";
import { Rinones, Props } from "./Composition";
import timing from "./timing.json";

const calc: CalculateMetadataFunction<Props> = ({ props }) => ({ durationInFrames: Math.ceil(props.timing.duration * 30) });
registerRoot(() => (
  <Composition id="Rinones" component={Rinones} fps={30} width={1080} height={1920} durationInFrames={1089}
    defaultProps={{ timing: timing as any, dpr: 1 } as Props} calculateMetadata={calc} />
));
