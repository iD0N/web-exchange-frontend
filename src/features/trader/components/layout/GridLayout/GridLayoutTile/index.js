import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

import IsLoggedIn from '../../../../../../common/services/user/IsLoggedIn';
import { MoveIconButton } from '../../../../../../common/components/trader';
import LoggedOutPlaceholder from '../../../placeholders/LoggedOutPlaceholder';
import ContractOutagePlaceholder from '../../../placeholders/ContractOutagePlaceholder';
import GlobalContractSummary from '../../../../features/order-entry/components/GlobalContractSummary';

import { GridLayoutContext } from '../';

class GridLayoutTile extends Component {
  static propTypes = {
    className: PropTypes.string,
    content: PropTypes.node,
    contentClassName: PropTypes.string,
    contentId: PropTypes.string,
    controls: PropTypes.node,
    footer: PropTypes.node,
    isLoggedIn: PropTypes.bool,
    noHeader: PropTypes.bool,
    requiresAuth: PropTypes.bool,
    title: PropTypes.node,
  };

  state = {
    key: 1,
  };

  setKey = () => this.setState({ key: this.state.key + 1 });

  render() {
    const {
      className,
      content,
      contentClassName,
      contentId,
      checkContractOutage,
      controls,
      isLoggedIn,
      footer,
      noHeader,
      requiresAuth,
      showContractSummary,
      title,
    } = this.props;
    return (
      <GridLayoutContext.Consumer key={this.state.key}>
        {({ id, isDragged, isDraggable }) => (
          <div className={cn('grid-layout-tile', className)} id={id}>
            {!noHeader && (
              <div className="grid-layout-tile-header">
                {title && <span className="grid-layout-tile-title">{title}</span>}
                <div className="grid-layout-tile-controls">
                  {isLoggedIn && controls}
                  {isDraggable && <MoveIconButton tooltipVisible={!isDragged} />}
                </div>
              </div>
            )}
            <div
              className={cn('grid-layout-tile-content', { [contentClassName]: true })}
              id={contentId}
            >
              {showContractSummary && <GlobalContractSummary />}
              {checkContractOutage && (!requiresAuth || isLoggedIn) ? (
                <ContractOutagePlaceholder
                  setKey={this.setKey}
                  contract={checkContractOutage.contractCode}
                >
                  {content}
                </ContractOutagePlaceholder>
              ) : requiresAuth && !isLoggedIn ? (
                <>
                  <LoggedOutPlaceholder title={title} />
                </>
              ) : (
                content
              )}
            </div>
            {footer && <div className="grid-layout-tile-footer">{footer}</div>}
          </div>
        )}
      </GridLayoutContext.Consumer>
    );
  }
}

export default IsLoggedIn(GridLayoutTile);
