from autobahn.asyncio.websocket import WebSocketServerProtocol
from uuid import uuid4
import json

connected = set()

class ServerProtocol(WebSocketServerProtocol):

    def onConnect(self, request):
        global connected
        connected.add(self)
        self.id = uuid4()
        print("Connection from: {}".format(request.peer))

    def onClose(self, wasClean, code, reason):
        global connected
        connected.remove(self)
        print("Connection close: {}".format(reason))

    def onMessage(self, payload, isBinary):
        if len(payload) > 1:
            return
        global connected
        print(self.id.hex, 'sent', payload)
        text = payload.decode('utf8')
        new_payload = {'id': self.id.hex, 'text': text}
        for socket in connected:
            if socket is not self:
                socket.sendMessage(json.dumps(new_payload, ensure_ascii = False).encode('utf8'))

if __name__ == '__main__':

    import asyncio

    from autobahn.asyncio.websocket import WebSocketServerFactory
    factory = WebSocketServerFactory()
    factory.protocol = ServerProtocol

    loop = asyncio.get_event_loop()
    coro = loop.create_server(factory, '127.0.0.1', 9000)
    server = loop.run_until_complete(coro)

    try:
        loop.run_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.close()
        loop.close()
