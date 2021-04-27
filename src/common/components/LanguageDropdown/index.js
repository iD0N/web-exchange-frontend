import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Dropdown from 'antd/lib/dropdown';
import Button from 'antd/lib/button';
import Icon from 'antd/lib/icon';
import Menu from 'antd/lib/menu';
import RetinaImage from 'react-retina-image';
import cn from 'classnames';

import { ENGLISH, LANGUAGES } from '../../services/i18n';

const { Item } = Menu;

class LanguageDropdown extends Component {
  static propTypes = {
    disabled: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.string,
    wrapperClassName: PropTypes.string,
    flagOnly: PropTypes.bool,
  };

  static defaultProps = {
    onChange: () => {},
    disabled: false,
    flagOnly: false,
  };

  state = {
    visible: false,
  };

  handleVisibleChange = visible => {
    if (!this.props.disabled) {
      this.setState({ visible });
    }
  };

  handleMenuClick = ({ key }) => {
    if (key && !this.props.disabled) {
      this.setState({ visible: false }, () => this.props.onChange(key));
    }
  };

  renderOverlay = langs => {
    return (
      <div className={cn('language-dropdown--wrapper', this.props.wrapperClassName)}>
        <Menu onClick={this.handleMenuClick}>
          {Object.keys(langs).map(lang => (
            <Item key={lang} value={lang}>
              <RetinaImage
                src={[langs[lang].flagImage, langs[lang].flagImage2x]}
                alt={`${langs[lang].text} flag`}
              />
              {this.props.flagOnly ? '' : langs[lang].text}
            </Item>
          ))}
        </Menu>
      </div>
    );
  };

  render() {
    const { value = ENGLISH, disabled } = this.props;
    const { visible } = this.state;
    const { [value]: activeLang, ...langs } = LANGUAGES;

    return (
      <div className="language-dropdown">
        <Dropdown
          disabled={disabled}
          overlay={this.renderOverlay(langs)}
          onVisibleChange={this.handleVisibleChange}
          visible={visible}
        >
          <Button
            key={value}
            className={cn('language-dropdown--trigger', {
              visible,
              'language-dropdown--trigger-disabled': disabled,
            })}
          >
            <Icon type="down" />
            <RetinaImage
              src={[activeLang.flagImage, activeLang.flagImage2x]}
              alt={`${activeLang.text} flag`}
            />
            {this.props.flagOnly ? '' : activeLang.text}
          </Button>
        </Dropdown>
      </div>
    );
  }
}

export default LanguageDropdown;
