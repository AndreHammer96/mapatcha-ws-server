const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let clientes = new Map(); // chave: número de celular

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    try {
      const data = JSON.parse(message);

      if (data.type === 'update_location') {
        clientes.set(data.numero, { ...data, ws });

        // Broadcast para todos conectados, exceto ele mesmo
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN && client !== ws) {
            client.send(JSON.stringify(data));
          }
        });
      }
    } catch (e) {
      console.error('Erro ao processar mensagem:', e);
    }
  });

  ws.on('close', function () {
    // Remove da lista ao desconectar
    for (const [numero, valor] of clientes.entries()) {
      if (valor.ws === ws) {
        clientes.delete(numero);
      }
    }
  });
});

app.get('/', (req, res) => res.send('Servidor WebSocket ONDE OS TCHÁ rodando!'));

server.listen(PORT, () => {
  console.log(`Servidor escutando em http://localhost:${PORT}`);
});
