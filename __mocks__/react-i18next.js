const React = require('react');
const reactI18next = require.requireActual('react-i18next');

const { Component } = React;

module.exports = {
  // this mock makes sure any components using the translate HoC receive the t function as a prop
  // the HoC must wrap into stateful component, to allow 'ref' prop
  translate: () => WrappedComponent =>
    class Translate extends Component {
      render() {
        return <WrappedComponent t={k => k} i18n={{ language: 'en' }} {...this.props} />;
      }
    },

  Trans: ({ children }) => children,
  I18n: ({ children }) => children(k => k, { i18n: {} }),

  // mock if needed
  Interpolate: reactI18next.Interpolate,
  I18nextProvider: reactI18next.I18nextProvider,
  loadNamespaces: reactI18next.loadNamespaces,
  reactI18nextModule: reactI18next.reactI18nextModule,
  setDefaults: reactI18next.setDefaults,
  getDefaults: reactI18next.getDefaults,
  setI18n: reactI18next.setI18n,
  getI18n: reactI18next.getI18n,
};
