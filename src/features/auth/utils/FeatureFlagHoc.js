import React from 'react';
import { FeatureFlag } from 'react-launch-darkly';

export function withFeatureFlag(OriginalComponent, flagKey) {
  return class extends React.Component {

    render() {
      return (
        <FeatureFlag
          flagKey={flagKey}
          renderFeatureCallback={variation => (
            <OriginalComponent 
              {...this.props} 
              variation={variation}
            />
          )}
        />

      )
    }
  }
}