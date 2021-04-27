import message from 'antd/lib/message';

message.config({
  top: 70,
  duration: 3,
});

const info = (content, duration) => message.info(content, duration);
const warn = (content, duration) => message.warn(content, duration);
const error = (content, duration) => message.error(content, duration);
const success = (content, duration) => message.success(content, duration);
const loading = (content, duration) => message.loading(content, duration);
const open = options => message.open(options);

export default {
  info,
  warn,
  error,
  success,
  loading,
  open,
};
