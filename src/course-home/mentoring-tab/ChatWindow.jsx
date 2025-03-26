import { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useIntl } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';
import {
  Avatar, Card, Form, StatefulButton, Stack, Alert,
} from '@openedx/paragon';

import { CHAT_STATUSES_MAP } from './constants';
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
      setChatMessages((prev) => [...prev, { sender: 'ai', text: msg.text }]);
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

    setChatMessages((prev) => [...prev, { sender: 'student', text: input }]);
    setStatus(CHAT_STATUSES_MAP.pending);
    setThinking(true);
    sendMessage({ text: input });
    setInput('');
  };

  useEffect(() => {
    lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  if (!OPENEDX_AI_SOCKET_DOMAIN) {
    return (
      <Alert variant="danger">
        {intl.formatMessage(messages.aiSocketDomainMissing)}
      </Alert>
    );
  }

  return (
    <Card className="w-100">
      <Card.Body>
        <Stack
          gap={3}
          className="p-3 d-flex flex-column"
          style={{ height: '28rem', overflowY: 'auto' }}
        >
          {chatMessages.map((msg, idx) => (
            <Stack
              key={idx} // eslint-disable-line react/no-array-index-key
              direction="horizontal"
              className={`w-100 fade-in ${msg.sender === 'student' ? 'justify-content-end' : 'justify-content-start'}`}
              gap={2}
              ref={idx === chatMessages.length - 1 ? lastMessageRef : null}
            >
              {msg.sender === 'ai' && (
                <Avatar size="sm" className="flex-shrink-0" />
              )}
              <div className="p-3 border rounded bg-light" style={{ maxWidth: '65%' }}>
                <p className="mb-0 small">{msg.text}</p>
              </div>
              <small className="text-muted d-block text-end">{msg.timestamp}</small>
            </Stack>
          ))}

          {thinking && (
            <Stack gap={2} direction="horizontal">
              <Avatar size="sm" className="flex-shrink-0" />
              <p className="text-muted small m-0">
                {intl.formatMessage(messages.thinking)}
              </p>
            </Stack>
          )}
        </Stack>

        <Stack direction="horizontal" gap={2} className="m-3">
          <Form.Control
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !isNotAllowedToSend && handleSend()}
            placeholder={intl.formatMessage(messages.placeholder)}
          />
          <StatefulButton
            state={status}
            disabled={isNotAllowedToSend}
            onClick={handleSend}
            labels={{
              default: intl.formatMessage(messages.send),
              pending: intl.formatMessage(messages.awaiting),
              error: intl.formatMessage(messages.error),
            }}
            disabledStates={disabledStates}
          />
        </Stack>
      </Card.Body>
    </Card>
  );
};

export default ChatWindow;
