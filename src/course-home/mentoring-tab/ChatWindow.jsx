import { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import { useIntl } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';
import {
  Avatar, Card, Form, StatefulButton, Stack, Alert, Icon,
} from '@openedx/paragon';
import { AutoAwesome as AutoAwesomeIcon, Cancel as CancelIcon } from '@openedx/paragon/icons';

import { CHAT_SENDERS, CHAT_STATUSES_MAP } from './constants';
import { useWebSocket } from './hooks';
import messages from './messages';

const ChatWindow = () => {
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [status, setStatus] = useState(CHAT_STATUSES_MAP.default);
  const lastMessageRef = useRef(null);

  const intl = useIntl();
  const { OPENEDX_AI_SOCKET_DOMAIN } = getConfig();
  const disabledStates = [CHAT_STATUSES_MAP.pending, CHAT_STATUSES_MAP.error];
  const isNotAllowedToSend = !input.trim() || disabledStates.includes(status);
  const { courseId } = useSelector(state => state.courseHome);

  const { sendMessage } = useWebSocket({
    url: `ws://${OPENEDX_AI_SOCKET_DOMAIN}/ws/chatgpt/${courseId}/`,
    onMessage: (msg) => {
      setChatMessages((prev) => [...prev, { sender: CHAT_SENDERS.ai, text: msg.text }]);
      setStatus(CHAT_STATUSES_MAP.default);
      setThinking(false);
    },
    onConnect: () => {},
    onError: () => {
      setStatus(CHAT_STATUSES_MAP.error);
      setThinking(false);
    },
  });

  const handleSend = () => {
    if (!input.trim()) {
      return;
    }

    setChatMessages((prev) => [...prev, { sender: CHAT_SENDERS.student, text: input }]);
    setStatus(CHAT_STATUSES_MAP.pending);
    setThinking(true);
    sendMessage({ text: input });
    setInput('');
  };

  useEffect(() => {
    lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const getAvatar = (sender) => (
    sender === CHAT_SENDERS.student ? (
      <Avatar size="sm" className="flex-shrink-0" />
    ) : (
      <AutoAwesomeIcon className="pgn__avatar pgn__avatar-sm flex-shrink-0 p-2 text-gray-900" />
    ));

  if (!OPENEDX_AI_SOCKET_DOMAIN) {
    return (
      <Alert variant="danger">
        {intl.formatMessage(messages.aiSocketDomainMissing)}
      </Alert>
    );
  }

  return (
    <Card className="w-100 mt-4.5">
      <Card.Body>
        <Stack
          gap={3}
          className="p-3 d-flex flex-column chat-window-wrapper"
        >
          {chatMessages.map((msg, idx) => (
            <Stack
              key={idx} // eslint-disable-line react/no-array-index-key
              direction="horizontal"
              className={classNames('w-100 fade-in align-items-end', {
                'justify-content-end': msg.sender === CHAT_SENDERS.student,
                'justify-content-start': msg.sender === CHAT_SENDERS.student,
              })}
              gap={2}
              ref={idx === chatMessages.length - 1 ? lastMessageRef : null}
            >
              {getAvatar(msg.sender)}
              <div
                className={classNames('p-3 chat-message', {
                  'bg-primary-100 rounded-right rounded-top': msg.sender === CHAT_SENDERS.ai,
                  'bg-primary-500 text-white rounded-left rounded-top order-first': msg.sender !== CHAT_SENDERS.ai,
                })}
              >
                <p className="mb-0">{msg.text}</p>
              </div>
            </Stack>
          ))}

          {thinking && (
            <Stack gap={2} direction="horizontal">
              {getAvatar(CHAT_SENDERS.ai)}
              <p className="text-muted m-0">
                {intl.formatMessage(messages.thinking)}
              </p>
            </Stack>
          )}
        </Stack>

        <Stack direction="horizontal" gap={2} className="m-3">
          <Form.Control
            value={input}
            size="lg"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !isNotAllowedToSend && handleSend()}
            placeholder={intl.formatMessage(messages.placeholder)}
          />
          <StatefulButton
            state={status}
            size="lg"
            disabled={isNotAllowedToSend}
            onClick={handleSend}
            labels={{
              [CHAT_STATUSES_MAP.default]: intl.formatMessage(messages.send),
              [CHAT_STATUSES_MAP.error]: intl.formatMessage(messages.error),
            }}
            icons={{
              [CHAT_STATUSES_MAP.error]: <Icon src={CancelIcon} />,
            }}
            disabledStates={disabledStates}
          />
        </Stack>
      </Card.Body>
    </Card>
  );
};

export default ChatWindow;
