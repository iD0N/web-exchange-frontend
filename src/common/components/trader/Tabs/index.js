import React, { Component, memo, createContext } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

const TabsContext = createContext('tabs');

const Tabs = memo(() => (
  <TabsContext.Consumer>
    {({ tabs, tabsT, activeKey, onChange }) => (
      <div className="tabs">
        {Object.values(tabs).map(t => (
          <div
            className={classnames('tab', { active: activeKey === t })}
            onClick={() => onChange(t)}
            key={t}
          >
            {tabsT[t]}
          </div>
        ))}
      </div>
    )}
  </TabsContext.Consumer>
));

class WithTabs extends Component {
  static propTypes = {
    children: PropTypes.func.isRequired,
    tabs: PropTypes.object.isRequired,
    tabsT: PropTypes.object.isRequired,
    defaultKey: PropTypes.string,
    onKeyChange: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {
      activeKey: this.props.defaultKey,
      keySetter: this.keySetter,
    };
  }

  keySetter = activeKey => this.setState({ activeKey });

  handleTabChange = activeKey => {
    this.setState({ activeKey }, () => this.props.onKeyChange && this.props.onKeyChange(activeKey));
  };

  render() {
    const { children, tabs, tabsT } = this.props;
    const { activeKey } = this.state;

    return (
      <TabsContext.Provider
        value={{
          tabs,
          tabsT,
          activeKey,
          onChange: this.handleTabChange,
        }}
      >
        {children(this.state)}
      </TabsContext.Provider>
    );
  }
}

Tabs.WithTabs = WithTabs;

export default Tabs;
