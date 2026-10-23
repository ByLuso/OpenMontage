import React from "react";
import { registerRoot, Composition, CalculateMetadataFunction } from "remotion";
import { Hipertrofia, Props } from "./Composition";
import timing from "./timing.json";

const calc: CalculateMetadataFunction<Props> = ({ props }) => ({ durationInFrames: Math.ceil(props.timing.duration * 30) });
registerRoot(() => (
  <Composition id="Hipertrofia" component={Hipertrofia} fps={30} width={1080} height={1920} durationInFrames={1098}
    defaultProps={{ timing: timing as any } as Props} calculateMetadata={calc} />
));
