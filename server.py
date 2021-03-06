from autobahn.asyncio.websocket import WebSocketServerProtocol
from uuid import uuid4
import json
import time

connected = set()

class ServerProtocol(WebSocketServerProtocol):

    def onConnect(self, request):
        global connected
        connected.add(self)
        self.id = uuid4()
        self.lastMsg = time.time()
        self.sendNumUsers()
        print("Connection from: {}".format(request.peer))

    def onClose(self, wasClean, code, reason):
        global connected
        connected.remove(self)
        self.sendNumUsers()
        print("Connection close: {}".format(reason))

    def onMessage(self, payload, isBinary):
        if len(payload) > 1:
            self.sendNumUsers()
            return
        global connected
        if time.time() - self.lastMsg > 5:
            self.id = uuid4()
        self.lastMsg = time.time()
        print(self.id.hex, 'sent', payload)
        text = payload.decode('utf8')
        obj = {'type': 'message', 'id': self.id.hex, 'text': text}
        new_payload = json.dumps(obj, ensure_ascii=False).encode('utf8')
        for socket in connected:
            if socket is not self:
                socket.sendMessage(new_payload)

    def sendNumUsers(self):
        global connected
        obj = {'type': 'users', 'users': len(connected)}
        payload = json.dumps(obj, ensure_ascii=False).encode('utf8')
        for socket in connected:
            socket.sendMessage(payload)

if __name__ == '__main__':

    import asyncio

    from autobahn.asyncio.websocket import WebSocketServerFactory
    factory = WebSocketServerFactory()
    factory.protocol = ServerProtocol

    loop = asyncio.get_event_loop()
    coro = loop.create_server(factory, '0.0.0.0', 9000)
    server = loop.run_until_complete(coro)

    try:
        loop.run_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.close()
        loop.close()
