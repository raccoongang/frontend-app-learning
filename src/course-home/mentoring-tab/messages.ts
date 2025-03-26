import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  title: {
    id: 'learning.mentoring.title',
    defaultMessage: 'Mentoring Assistant',
    description: 'The title of mentoring tab (course timeline).',
  },
  thinking: {
    id: 'learning.mentoring.message.thinking',
    defaultMessage: 'Thinking...',
    description: 'Shown while the Chat is processing the user message',
  },
  placeholder: {
    id: 'learning.mentoring.input.placeholder',
    defaultMessage: 'Type your message',
    description: 'Placeholder text inside the chat input field',
  },
  send: {
    id: 'learning.mentoring.button.send',
    defaultMessage: 'Send',
    description: 'Label for the send button in its default state',
  },
  awaiting: {
    id: 'learning.mentoring.button.awaiting',
    defaultMessage: 'Awaiting reply...',
    description: 'Label for the send button while waiting for chat reply',
  },
  error: {
    id: 'learning.mentoring.button.error',
    defaultMessage: 'Error',
    description: 'Label for the send button when an error occurs',
  },
  aiSocketDomainMissing: {
    id: 'learning.mentoring.error.missingSocketDomain',
    defaultMessage: 'Configuration Error: OPENEDX_AI_SOCKET_DOMAIN is not defined. '
        + 'Please set the WebSocket domain in your environment settings to enable AI communication.',
    description: 'Error shown when the WebSocket domain is not provided in the configuration',
  },
});

export default messages;
