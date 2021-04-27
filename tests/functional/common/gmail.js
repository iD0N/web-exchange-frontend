/**
 * A helper module which assists with reading mail for a given test address from Gmail.
 *
 * This helper uses IMAP internally, so we can deal with mail programmatically and not
 * mess with scripting against the Gmail interface.
 */

const { default: IMAPClient, LOG_LEVEL_WARN } = require('emailjs-imap-client');
const simpleParser = require('mailparser').simpleParser;

const sleep = require('await-sleep');

const config = require('../config');

const { email, appPassword } = config.googleCredentials;

// uber-hacky fix for new Node rejecting self-signed TLS
// and imap.gmail.com serving a self-signed cert unless
// you add special SNI headers (which our imap lib can't do)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

/**
 * Generate a new test address which can be used to register for Crypto and retrieve
 * messages useng getMessages.
 */
const getAddress = () => {
  const [pre, post] = email.split('@');
  // include a random salt on the off-chance that we have a conflict when launching
  // two tests at the exact same time in one run
  const salt = Math.floor(Math.random() * 10000);
  return `${pre}+${new Date().valueOf()}_${salt}@${post}`;
};

/**
 * Get all messages for a given test email address (e.g. evermarketsautomatedtesting+blah@gmail.com)
 * from gmail via IMAP.
 *
 * If no messages are found, it will poll every 'retry' seconds until 'timeout' is reached before returning
 * an empty list.
 *
 * Optionally, may pass a regex to filter by email subject. Only matching messages will be returned, and
 * the method will poll until timeout or matching messages are found, even if non-matching messages exist.
 */
const getMessages = async (
  address,
  { retry = 5 * 1000, timeout = 60 * 1000, subject = /.*/ } = {}
) => {
  const client = new IMAPClient('imap.gmail.com', 993, {
    auth: {
      user: email,
      pass: appPassword,
    },
    useSecureTransport: true,
    logLevel: LOG_LEVEL_WARN,
  });
  client.onerror = err => {
    throw err;
  };

  try {
    await client.connect();

    const start = new Date().valueOf();

    while (true) {
      // TODO we could make this smarter by passing the subject search along (but that may not support full regex?)
      const search = await client.search('INBOX', { to: address });
      // TODO we could make this smarter by filtering out IDs we've seen already
      if (search.length) {
        const messages = await client.listMessages('INBOX', search, ['envelope', 'body[]']);
        const matches = messages.filter(
          m => m.envelope && m.envelope.subject && m.envelope.subject.match(subject)
        );
        if (matches.length) {
          return Promise.all(matches.map(m => simpleParser(m['body[]'])));
        }
      }
      const now = new Date().valueOf();
      if (now - start > timeout) {
        throw new Error(`Timed out getting messages matching '${subject}' for '${address}'`);
      }
      await sleep(retry);
    }
  } finally {
    await client.close();
  }
};

module.exports = {
  getAddress,
  getMessages,
};
