module.exports = {
  options: {
    debug: true,
    sort: true,
    func: {
      list: ['t'],
      extensions: ['.js'],
    },
    trans: {
      extensions: ['.js'],
    },
    lngs: ['en', 'ko', 'pt', 'ru', 'vi', 'zh'],
    ns: ['resource'],
    defaultNs: 'resource',
    resource: {
      loadPath: 'src/resources/locales/{{lng}}/{{ns}}.json',
      savePath: 'src/resources/locales/{{lng}}/{{ns}}.json',
    },
    nsSeparator: false,
  },
};
