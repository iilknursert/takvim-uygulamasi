import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

let stompClient;

export const connectWebSocket = (onMessageReceived) => {
  const socket = new SockJS("http://localhost:9191/ws");
  stompClient = Stomp.over(socket);

  stompClient.connect({}, () => {
    stompClient.subscribe("/topic/mesajlar", (gelenMesaj) => {
      const body = JSON.parse(gelenMesaj.body);
      onMessageReceived(body);
    });
  });
};

export const mesajGonder = (mesaj) => {
    if (stompClient && stompClient.connected) {
      stompClient.send("/app/gonder", {}, JSON.stringify(mesaj));
    }
  };
  
export const sendMessage = (mesaj) => {
  if (stompClient && stompClient.connected) {
    stompClient.send("/app/gonder", {}, JSON.stringify(mesaj));
  }
};
