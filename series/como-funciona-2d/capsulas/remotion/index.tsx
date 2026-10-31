import React from "react";
import { registerRoot, Composition, Still, CalculateMetadataFunction } from "remotion";
import { Episode, Props, COMP_ID } from "./Composition";
import { Cover } from "./Cover";
import timingDefault from "./timing.json";

const calc: CalculateMetadataFunction<Props> = ({ props }) => ({ durationInFrames: Math.ceil(props.timing.duration * 30) });

const Root: React.FC = () => (
  <>
    <Composition id={COMP_ID} component={Episode} fps={30} width={1080} height={1920}
      durationInFrames={900} defaultProps={{ timing: timingDefault as any, debug: false }} calculateMetadata={calc} />
    <Still id="Portada" component={Cover} width={1080} height={1920} />
  </>
);
registerRoot(Root);
