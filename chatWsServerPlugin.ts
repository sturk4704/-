import type { Plugin, ViteDevServer } from 'vite';
import { WebSocketServer, WebSocket } from 'ws';
import type { IncomingMessage } from 'http';
import type { Socket } from 'net';

interface StoredMessage {
  id: string;
  teamId: string;
  channel: 'scheduling' | 'general' | 'tactics';
  senderId: string;
  senderName: string;
  senderRole: 'captain' | 'vice_captain' | 'player';
  senderPosition: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  createdAt: number;
  type: 'text' | 'schedule_poll' | 'system_announcement';
  pollData?: {
    eventTitle: string;
    date: string;
    time: string;
    pitchName: string;
    neighborhood: string;
    format: '5x5' | '7x7' | '8x8' | '9x9' | '11x11';
    requiredPlayers: number;
    confirmedPlayerIds: string[];
    declinedPlayerIds: string[];
    tentativePlayerIds: string[];
  };
  reactions?: Record<string, string[]>;
}

interface ConnectedClient {
  ws: WebSocket;
  id: string;
  name: string;
  role: string;
  avatar: string;
}

export function teamChatWebSocketPlugin(): Plugin {
  let wss: WebSocketServer | null = null;
  const clients = new Map<WebSocket, ConnectedClient>();

  // In-memory messages seed for team chat
  const messages: StoredMessage[] = [
    {
      id: 'msg-system-welcome',
      teamId: 'rawdah_stars',
      channel: 'scheduling',
      senderId: 'system',
      senderName: 'نظام كابتن جدة المباشر',
      senderRole: 'captain',
      senderPosition: 'BOT',
      senderAvatar: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=120&auto=format&fit=crop&q=80',
      text: 'مرحباً بكم في غرفة التواصل المباشر لفريق [نجوم الروضة بجدة]. استخدموا هذه النافذة للتنسيق الفوري لمواعيد المباريات، استطلاع الجاهزية، ومناقشة الخطط.',
      timestamp: 'منذ ساعتين',
      createdAt: Date.now() - 7200000,
      type: 'system_announcement'
    },
    {
      id: 'msg-poll-match',
      teamId: 'rawdah_stars',
      channel: 'scheduling',
      senderId: 'player-1',
      senderName: 'عمر باوزير (الكابتن)',
      senderRole: 'captain',
      senderPosition: 'CAM',
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      text: 'يا أبطال، حجزت لنا موعد ودية حماسية 8 ضد 8 بملعب الفهد بحي الروضة. نبي نأكد العدد بالكامل قبل ما نسدد العربون المشترك!',
      timestamp: 'منذ ساعة',
      createdAt: Date.now() - 3600000,
      type: 'schedule_poll',
      pollData: {
        eventTitle: 'مباراة ودية رسمية ضد نمور الكورنيش (8x8)',
        date: 'الخميس 17 سبتمبر 2026',
        time: '09:00 مساءً - 10:30 مساءً',
        pitchName: 'ملعب الفهد الرياضي المعتمد',
        neighborhood: 'حي الروضة، جدة',
        format: '8x8',
        requiredPlayers: 8,
        confirmedPlayerIds: ['player-1', 'player-2', 'player-3', 'player-4', 'player-5'],
        declinedPlayerIds: [],
        tentativePlayerIds: ['player-6']
      },
      reactions: {
        '🔥': ['player-1', 'player-2', 'player-3'],
        '⚽': ['player-1', 'player-4']
      }
    },
    {
      id: 'msg-reply-1',
      teamId: 'rawdah_stars',
      channel: 'scheduling',
      senderId: 'player-2',
      senderName: 'طارق الحربي',
      senderRole: 'vice_captain',
      senderPosition: 'CB',
      senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
      text: 'أنا أكدت حضوري وجاهز بالكامل إن شاء الله! الدفاع مضمون والتسديد المشترك جاهز في المحفظة 👍',
      timestamp: 'منذ 45 دقيقة',
      createdAt: Date.now() - 2700000,
      type: 'text',
      reactions: {
        '👍': ['player-1', 'player-3']
      }
    },
    {
      id: 'msg-reply-2',
      teamId: 'rawdah_stars',
      channel: 'scheduling',
      senderId: 'player-3',
      senderName: 'سعود الشهري',
      senderRole: 'player',
      senderPosition: 'ST',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      text: 'حاضر ومعاكم بإذن الله! باقي لنا لاعبين في الوسط عشان يكتمل نصاب التشكيلة الأساسية والاحتياط.',
      timestamp: 'منذ 25 دقيقة',
      createdAt: Date.now() - 1500000,
      type: 'text',
      reactions: {
        '⚽': ['player-1']
      }
    },
    {
      id: 'msg-general-1',
      teamId: 'rawdah_stars',
      channel: 'general',
      senderId: 'player-1',
      senderName: 'عمر باوزير (الكابتن)',
      senderRole: 'captain',
      senderPosition: 'CAM',
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      text: 'يعطيكم العافية جميعاً، شفت إحصائيات آخر مباراة في لوحة التقييم، التطور في سرعة التحول والتمرير ملحوظ جداً، استمروا على هذا المستوى!',
      timestamp: 'منذ 15 دقيقة',
      createdAt: Date.now() - 900000,
      type: 'text',
      reactions: {
        '👏': ['player-2', 'player-3', 'player-4']
      }
    },
    {
      id: 'msg-tactics-1',
      teamId: 'rawdah_stars',
      channel: 'tactics',
      senderId: 'player-2',
      senderName: 'طارق الحربي',
      senderRole: 'vice_captain',
      senderPosition: 'CB',
      senderAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
      text: 'اقتراح لتكتيك الخميس: نلعب بضغط عالي في أول ربع ساعة مع استغلال سرعة الأجنحة لفتح مساحات خلف أظهرة الخصم.',
      timestamp: 'منذ 10 دقائق',
      createdAt: Date.now() - 600000,
      type: 'text',
      reactions: {
        '💡': ['player-1', 'player-3']
      }
    }
  ];

  function broadcast(data: any, excludeWs?: WebSocket) {
    const payload = JSON.stringify(data);
    clients.forEach((client, clientWs) => {
      if (clientWs !== excludeWs && clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(payload);
      }
    });
  }

  function getOnlineUsers() {
    return Array.from(clients.values()).map(c => ({
      id: c.id,
      name: c.name,
      role: c.role,
      avatar: c.avatar
    }));
  }

  return {
    name: 'team-chat-websocket-plugin',
    configureServer(server: ViteDevServer) {
      if (!server.httpServer) return;

      wss = new WebSocketServer({ noServer: true });

      server.httpServer.on('upgrade', (req: IncomingMessage, socket: Socket, head: Buffer) => {
        try {
          const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
          if (url.pathname === '/api/chat-ws') {
            wss?.handleUpgrade(req, socket, head, (ws) => {
              wss?.emit('connection', ws, req);
            });
          }
        } catch {
          // ignore other paths
        }
      });

      wss.on('connection', (ws: WebSocket) => {
        const tempId = 'user-' + Math.random().toString(36).substring(2, 8);
        clients.set(ws, {
          ws,
          id: tempId,
          name: 'لاعب كابتن جدة',
          role: 'player',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
        });

        // Send initial state to newly connected client
        ws.send(JSON.stringify({
          type: 'init',
          messages,
          onlineUsers: getOnlineUsers()
        }));

        // Broadcast presence
        broadcast({
          type: 'presence:update',
          onlineUsers: getOnlineUsers()
        });

        ws.on('message', (raw: string | Buffer) => {
          try {
            const data = JSON.parse(raw.toString());

            if (data.type === 'user:join') {
              const current = clients.get(ws);
              if (current) {
                current.id = data.user.id || current.id;
                current.name = data.user.name || current.name;
                current.role = data.user.role || current.role;
                current.avatar = data.user.avatar || current.avatar;
              }
              broadcast({
                type: 'presence:update',
                onlineUsers: getOnlineUsers()
              });
            } else if (data.type === 'chat:send') {
              const newMsg: StoredMessage = {
                id: data.message.id || `msg-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
                teamId: data.message.teamId || 'rawdah_stars',
                channel: data.message.channel || 'scheduling',
                senderId: data.message.senderId,
                senderName: data.message.senderName,
                senderRole: data.message.senderRole || 'player',
                senderPosition: data.message.senderPosition || 'CM',
                senderAvatar: data.message.senderAvatar,
                text: data.message.text,
                timestamp: 'الآن',
                createdAt: Date.now(),
                type: data.message.type || 'text',
                pollData: data.message.pollData,
                reactions: {}
              };

              // Guard against duplicates
              if (!messages.some(m => m.id === newMsg.id)) {
                messages.push(newMsg);
              }

              broadcast({
                type: 'chat:message',
                message: newMsg
              });
            } else if (data.type === 'chat:poll_vote') {
              const { messageId, playerId, voteType } = data; // voteType: 'confirm' | 'decline' | 'tentative'
              const msg = messages.find(m => m.id === messageId);
              if (msg && msg.pollData) {
                // remove from all arrays
                msg.pollData.confirmedPlayerIds = msg.pollData.confirmedPlayerIds.filter(id => id !== playerId);
                msg.pollData.declinedPlayerIds = msg.pollData.declinedPlayerIds.filter(id => id !== playerId);
                msg.pollData.tentativePlayerIds = msg.pollData.tentativePlayerIds.filter(id => id !== playerId);

                if (voteType === 'confirm') {
                  msg.pollData.confirmedPlayerIds.push(playerId);
                } else if (voteType === 'decline') {
                  msg.pollData.declinedPlayerIds.push(playerId);
                } else if (voteType === 'tentative') {
                  msg.pollData.tentativePlayerIds.push(playerId);
                }

                broadcast({
                  type: 'chat:poll_updated',
                  messageId,
                  pollData: msg.pollData
                });
              }
            } else if (data.type === 'chat:reaction') {
              const { messageId, emoji, playerId } = data;
              const msg = messages.find(m => m.id === messageId);
              if (msg) {
                if (!msg.reactions) msg.reactions = {};
                if (!msg.reactions[emoji]) msg.reactions[emoji] = [];

                if (msg.reactions[emoji].includes(playerId)) {
                  msg.reactions[emoji] = msg.reactions[emoji].filter(id => id !== playerId);
                  if (msg.reactions[emoji].length === 0) {
                    delete msg.reactions[emoji];
                  }
                } else {
                  msg.reactions[emoji].push(playerId);
                }

                broadcast({
                  type: 'chat:reaction_updated',
                  messageId,
                  reactions: msg.reactions
                });
              }
            }
          } catch (err) {
            console.error('Error handling WebSocket message:', err);
          }
        });

        ws.on('close', () => {
          clients.delete(ws);
          broadcast({
            type: 'presence:update',
            onlineUsers: getOnlineUsers()
          });
        });

        ws.on('error', () => {
          clients.delete(ws);
        });
      });
    }
  };
}
