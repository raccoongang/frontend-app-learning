import { useEffect, useRef } from 'react';

/**
 * Custom hook to manage a WebSocket connection.
 *
 * @param {string} url - The WebSocket server URL to connect to.
 * @param {function} onMessage - Callback function to handle incoming messages.
 * @param {function} onConnect - Callback function to handle success connection.
 * @param {function} onError - Callback function to handle errors.
 * @returns {Object} - An object containing a function `sendMessage`
 * to send messages through the WebSocket connection.
 */
function useWebSocket({
  url, onMessage, onError, onConnect,
}) {
  const socket = useRef(null);

  useEffect(() => {
    socket.current = new WebSocket(url);
    socket.current.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        onMessage(data);
      } catch (err) {
        onMessage({ text: e.data });
      }
    };
    socket.current.onerror = onError;
    socket.current.onopen = onConnect;
    return () => socket.current?.close();
  }, [url]);

  const sendMessage = (msg) => {
    if (socket.current.readyState === WebSocket.OPEN) {
      socket.current.send(JSON.stringify(msg));
    }
  };

  return { sendMessage };
}

export default useWebSocket;
