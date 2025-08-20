import { Server } from 'socket.io';
import { createServer } from 'http';
import Client from 'socket.io-client';

// Mock DB models and JWT helper inside the module under test
jest.mock('../src/model/roomMember', () => ({
  __esModule: true,
  default: { findOne: jest.fn().mockResolvedValue(true) },
}));

jest.mock('../src/model/message', () => ({
  __esModule: true,
  default: {
    create: jest.fn().mockImplementation(async (payload: any) => ({ id: 'm1', ...payload })),
    update: jest.fn().mockResolvedValue([1]),
  },
}));

jest.mock('../src/middleware/verifyJWT', () => ({
  __esModule: true,
  verifyToken: jest.fn(() => ({ id: 'u1', username: 'tester' })),
}));

import chatSocket from '../src/socket/chatEvent';
import MessageModel from '../src/model/message';

describe('Socket message delivery flow', () => {
  let io: Server;
  let httpServer: any;
  let httpServerAddr: any;

  beforeAll((done) => {
    httpServer = createServer();
    io = new Server(httpServer, { cors: { origin: '*' } });
    chatSocket(io);
    httpServer.listen(() => {
      httpServerAddr = httpServer.address();
      done();
    });
  });

  afterAll((done) => {
    io.close();
    httpServer.close(done);
  });

  test('send_message persists and receive_message is emitted; delivery receipt updates', async () => {
    const port = httpServerAddr.port;
    const url = `http://localhost:${port}`;

    // connect two clients to observe broadcast
    const clientOptions = { autoConnect: false, forceNew: true, auth: { token: 'fake' } } as any;
    const c1 = Client(url, clientOptions);
    const c2 = Client(url, clientOptions);

    await new Promise<void>((resolve) => {
      let connected = 0;
      const onConnected = () => { if (++connected === 2) resolve(); };
      c1.on('connect', onConnected);
      c2.on('connect', onConnected);
      c1.connect();
      c2.connect();
    });

    // Both are members (RoomMemberModel mocked to true), join same room
    c1.emit('join_room', { roomId: 'r1' });
    c2.emit('join_room', { roomId: 'r1' });

    const received = new Promise<any>((resolve) => {
      c2.on('receive_message', (msg: any) => resolve(msg));
    });

    c1.emit('send_message', { roomId: 'r1', content: 'Hello' });
    const message = await received;
    expect(message.content).toBe('Hello');
    expect(message.roomId).toBe('r1');

    // delivery receipt flow
    const deliveredAck = new Promise<void>((resolve) => {
      c2.on('message_delivered', ({ messageId, roomId }: any) => {
        try {
          expect(messageId).toBe('m1');
          expect(roomId).toBe('r1');
          resolve();
        } catch (e) {
          // ignore
        }
      });
    });

    c1.emit('message_delivered', { messageId: 'm1', roomId: 'r1' });
    await deliveredAck;

    // ensure DB update was called
    expect((MessageModel.update as any).mock.calls[0][0]).toHaveProperty('deliveredAt');

    c1.disconnect();
    c2.disconnect();
  }, 15000);
});


