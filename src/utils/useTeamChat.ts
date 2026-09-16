import { useState, useEffect, useRef, useCallback } from 'react';
import { TeamChatMessage, TeamChatChannel, ChatPollData, Player } from '../types';
import { INITIAL_CHAT_MESSAGES } from '../data/mockTeamDiary';
import { TEAM_ROSTER_25, getRosterPlayer } from '../data/teamRoster';

const STORAGE_KEY = 'captain_jeddah_team_chat_messages_v2';

export interface OnlineUser {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

export function useTeamChat(currentSender: {
  id: string;
  name: string;
  role: 'captain' | 'vice_captain' | 'player';
  position: string;
  avatar: string;
}) {
  const [messages, setMessages] = useState<TeamChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Ensure internal scrimmage poll is included
          const hasInternalPoll = parsed.some((m: TeamChatMessage) => m.id === 'msg-poll-internal-scrimmage');
          if (hasInternalPoll) {
            return parsed;
          }
          const internalMsg = INITIAL_CHAT_MESSAGES.find((m) => m.id === 'msg-poll-internal-scrimmage');
          if (internalMsg) {
            return [...parsed, internalMsg];
          }
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_CHAT_MESSAGES;
  });

  const [activeChannel, setActiveChannel] = useState<TeamChatChannel>('scheduling');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([
    {
      id: currentSender.id,
      name: currentSender.name,
      role: currentSender.role,
      avatar: currentSender.avatar,
    },
    {
      id: 'player-2',
      name: 'طارق الحربي',
      role: 'vice_captain',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    },
    {
      id: 'player-3',
      name: 'سعود الشهري',
      role: 'player',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80',
    }
  ]);

  const socketRef = useRef<WebSocket | null>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  // Save to localStorage whenever messages update
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages]);

  // Connect to WebSocket and setup BroadcastChannel
  useEffect(() => {
    // Setup BroadcastChannel for cross-tab local sync
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('captain_jeddah_chat_channel');
        broadcastChannelRef.current = bc;
        bc.onmessage = (event) => {
          const { type, payload } = event.data;
          if (type === 'chat:message') {
            setMessages((prev) => {
              if (prev.some((m) => m.id === payload.id)) return prev;
              return [...prev, payload];
            });
          } else if (type === 'chat:poll_updated') {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === payload.messageId ? { ...m, pollData: payload.pollData } : m
              )
            );
          } else if (type === 'chat:reaction_updated') {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === payload.messageId ? { ...m, reactions: payload.reactions } : m
              )
            );
          }
        };
      }
    } catch {
      // broadcast channel fallback
    }

    let isUnmounted = false;

    function connectWs() {
      if (typeof window === 'undefined') return;

      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        const wsUrl = `${protocol}//${host}/api/chat-ws`;

        const ws = new WebSocket(wsUrl);
        socketRef.current = ws;

        ws.onopen = () => {
          if (isUnmounted) {
            ws.close();
            return;
          }
          setIsConnected(true);

          // Announce presence
          ws.send(
            JSON.stringify({
              type: 'user:join',
              user: {
                id: currentSender.id,
                name: currentSender.name,
                role: currentSender.role,
                avatar: currentSender.avatar,
              },
            })
          );
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'init') {
              if (Array.isArray(data.messages) && data.messages.length > 0) {
                setMessages((prev) => {
                  const map = new Map<string, TeamChatMessage>();
                  data.messages.forEach((m: TeamChatMessage) => map.set(m.id, m));
                  prev.forEach((m) => map.set(m.id, m)); // keep local recent additions
                  return Array.from(map.values()).sort((a, b) => a.createdAt - b.createdAt);
                });
              }
              if (Array.isArray(data.onlineUsers) && data.onlineUsers.length > 0) {
                setOnlineUsers(data.onlineUsers);
              }
            } else if (data.type === 'chat:message') {
              setMessages((prev) => {
                if (prev.some((m) => m.id === data.message.id)) return prev;
                return [...prev, data.message];
              });
            } else if (data.type === 'chat:poll_updated') {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === data.messageId ? { ...m, pollData: data.pollData } : m
                )
              );
            } else if (data.type === 'chat:reaction_updated') {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === data.messageId ? { ...m, reactions: data.reactions } : m
                )
              );
            } else if (data.type === 'presence:update') {
              if (Array.isArray(data.onlineUsers)) {
                setOnlineUsers(data.onlineUsers);
              }
            }
          } catch (err) {
            console.error('Error parsing WS message:', err);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          socketRef.current = null;
          if (!isUnmounted) {
            reconnectTimeoutRef.current = window.setTimeout(connectWs, 3500);
          }
        };

        ws.onerror = () => {
          setIsConnected(false);
        };
      } catch (e) {
        setIsConnected(false);
        if (!isUnmounted) {
          reconnectTimeoutRef.current = window.setTimeout(connectWs, 4000);
        }
      }
    }

    connectWs();

    return () => {
      isUnmounted = true;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
      }
    };
  }, [currentSender.id, currentSender.name, currentSender.role, currentSender.avatar]);

  // Send a new message
  const sendMessage = useCallback(
    (
      text: string,
      type: 'text' | 'schedule_poll' | 'system_announcement' = 'text',
      pollData?: ChatPollData,
      targetChannel?: TeamChatChannel
    ) => {
      const channel = targetChannel || activeChannel;
      const newMsg: TeamChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        teamId: 'rawdah_stars',
        channel,
        senderId: currentSender.id,
        senderName: currentSender.name,
        senderRole: currentSender.role,
        senderPosition: currentSender.position,
        senderAvatar: currentSender.avatar,
        text,
        timestamp: 'الآن',
        createdAt: Date.now(),
        type,
        pollData,
        reactions: {},
      };

      // Optimistic update locally
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });

      // Send to WebSocket server
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            type: 'chat:send',
            message: newMsg,
          })
        );
      }

      // Broadcast across tabs
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.postMessage({
          type: 'chat:message',
          payload: newMsg,
        });
      }
    },
    [activeChannel, currentSender]
  );

  // Vote on a match scheduling poll with strict FIFO order and automatic waitlist promotion
  const votePoll = useCallback(
    (
      messageId: string,
      voteType: 'confirm' | 'decline' | 'tentative',
      targetPlayerId?: string,
      onPromotedCallback?: (promotedPlayerName: string, replacedPlayerName: string) => void
    ) => {
      const playerId = targetPlayerId || currentSender.id;
      let systemAnnouncementMessage: TeamChatMessage | null = null;
      let promotedPlayerInfo: { promotedName: string; replacedName: string } | null = null;

      setMessages((prev) => {
        const nextMessages = [...prev];
        const targetIndex = nextMessages.findIndex((m) => m.id === messageId);
        if (targetIndex === -1 || !nextMessages[targetIndex].pollData) return prev;

        const targetMsg = nextMessages[targetIndex];
        const poll: ChatPollData = { ...targetMsg.pollData };

        let confirmed = [...(poll.confirmedPlayerIds || [])];
        let waitingList = [...(poll.waitingListPlayerIds || [])];
        let declined = [...(poll.declinedPlayerIds || [])];
        let tentative = [...(poll.tentativePlayerIds || [])];

        const wasInConfirmed = confirmed.includes(playerId);

        // Remove voter from all lists first
        confirmed = confirmed.filter((id) => id !== playerId);
        waitingList = waitingList.filter((id) => id !== playerId);
        declined = declined.filter((id) => id !== playerId);
        tentative = tentative.filter((id) => id !== playerId);

        if (voteType === 'confirm') {
          // FIFO Check: if confirmed squad count < requiredPlayers, join confirmed squad
          if (confirmed.length < poll.requiredPlayers) {
            confirmed.push(playerId);
          } else {
            // Otherwise, join the waiting list in exact order of arrival
            waitingList.push(playerId);
          }
        } else if (voteType === 'decline') {
          declined.push(playerId);

          // AUTOMATIC PROMOTION: If this player was in the confirmed squad, promote #1 from waiting list!
          if (wasInConfirmed && waitingList.length > 0) {
            const promotedId = waitingList[0];
            waitingList = waitingList.slice(1);
            confirmed.push(promotedId);

            const replacedRoster = getRosterPlayer(playerId);
            const promotedRoster = getRosterPlayer(promotedId);
            const replacedName = replacedRoster?.name || 'أحد اللاعبين الأساسيين';
            const promotedName = promotedRoster?.name || 'اللاعب التالي في الانتظار';

            promotedPlayerInfo = { promotedName, replacedName };

            poll.promotedPlayerAlert = {
              promotedPlayerId: promotedId,
              promotedPlayerName: promotedName,
              replacedPlayerName: replacedName,
              timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
            };

            // Build instant system announcement in chat
            systemAnnouncementMessage = {
              id: `msg-promo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              teamId: targetMsg.teamId,
              channel: targetMsg.channel,
              senderId: 'system',
              senderName: 'نظام النزاهة التلقائي (FIFO)',
              senderRole: 'captain',
              senderPosition: 'BOT',
              senderAvatar: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=120&auto=format&fit=crop&q=80',
              text: `🚨 تحديث التشكيلة الفوري (نزاهة وحصر الحضور):\nاعتذر اللاعب [ ${replacedName} ] عن خوض المباراة، وبناءً على مبدأ الأولوية لمن حضر وسجل أولاً، تم تلقائياً تصعيد اللاعب [ ${promotedName} ] من قائمة الانتظار إلى تشكيلة الكابتن الأساسية! 🎉🏃‍♂️\n\n📲 تم إرسال إشعار فوري وتنبيه للاعب لدخول تشكيلة المباراة.`,
              timestamp: 'الآن',
              createdAt: Date.now(),
              type: 'system_announcement',
            };
          }
        } else if (voteType === 'tentative') {
          tentative.push(playerId);

          // If was in confirmed and is now tentative, also promote from waiting list
          if (wasInConfirmed && waitingList.length > 0) {
            const promotedId = waitingList[0];
            waitingList = waitingList.slice(1);
            confirmed.push(promotedId);

            const replacedRoster = getRosterPlayer(playerId);
            const promotedRoster = getRosterPlayer(promotedId);
            const replacedName = replacedRoster?.name || 'أحد اللاعبين الأساسيين';
            const promotedName = promotedRoster?.name || 'اللاعب التالي في الانتظار';

            promotedPlayerInfo = { promotedName, replacedName };

            poll.promotedPlayerAlert = {
              promotedPlayerId: promotedId,
              promotedPlayerName: promotedName,
              replacedPlayerName: replacedName,
              timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
            };

            systemAnnouncementMessage = {
              id: `msg-promo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              teamId: targetMsg.teamId,
              channel: targetMsg.channel,
              senderId: 'system',
              senderName: 'نظام النزاهة التلقائي (FIFO)',
              senderRole: 'captain',
              senderPosition: 'BOT',
              senderAvatar: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=120&auto=format&fit=crop&q=80',
              text: `🚨 تحديث التشكيلة الفوري (تغيير حالة الحضور):\nأصبح حضور اللاعب [ ${replacedName} ] غير مؤكد (احتمال)، وطبقاً لمبدأ النزاهة تم تلقائياً تصعيد اللاعب [ ${promotedName} ] من قائمة الانتظار إلى تشكيلة الكابتن الأساسية! 🎉🏃‍♂️`,
              timestamp: 'الآن',
              createdAt: Date.now(),
              type: 'system_announcement',
            };
          }
        }

        // Dynamically update 50/50 team division for internal scrimmage (Team A vs Team B)
        if (poll.matchType === 'internal_scrimmage' || poll.eventTitle.includes('تقسيمة')) {
          poll.teamADivision = confirmed.filter((_, idx) => idx % 2 === 0);
          poll.teamBDivision = confirmed.filter((_, idx) => idx % 2 !== 0);
        }

        poll.confirmedPlayerIds = confirmed;
        poll.waitingListPlayerIds = waitingList;
        poll.declinedPlayerIds = declined;
        poll.tentativePlayerIds = tentative;

        nextMessages[targetIndex] = {
          ...targetMsg,
          pollData: poll,
        };

        if (systemAnnouncementMessage) {
          nextMessages.push(systemAnnouncementMessage);
        }

        return nextMessages;
      });

      if (promotedPlayerInfo && onPromotedCallback) {
        onPromotedCallback(promotedPlayerInfo.promotedName, promotedPlayerInfo.replacedName);
      }

      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            type: 'chat:poll_vote',
            messageId,
            playerId,
            voteType,
          })
        );
      }
    },
    [currentSender.id]
  );

  // Helper to simulate a starter apologizing to test automatic promotion in real-time
  const simulateStarterApology = useCallback(
    (messageId: string, playerIndexToApologize?: number) => {
      const targetMsg = messages.find((m) => m.id === messageId);
      if (!targetMsg || !targetMsg.pollData) return;

      const confirmed = targetMsg.pollData.confirmedPlayerIds || [];
      if (confirmed.length === 0) return;

      const index = typeof playerIndexToApologize === 'number' && playerIndexToApologize < confirmed.length
        ? playerIndexToApologize
        : Math.max(0, confirmed.length - 1); // default to the latest starter or specified starter

      const playerToDecline = confirmed[index];
      votePoll(messageId, 'decline', playerToDecline);
    },
    [messages, votePoll]
  );

  // Helper to simulate a new player joining the waitlist in real-time
  const simulateWaitlistJoin = useCallback(
    (messageId: string) => {
      const targetMsg = messages.find((m) => m.id === messageId);
      if (!targetMsg || !targetMsg.pollData) return;

      const poll = targetMsg.pollData;
      const allRegistered = [
        ...(poll.confirmedPlayerIds || []),
        ...(poll.waitingListPlayerIds || []),
        ...(poll.declinedPlayerIds || []),
        ...(poll.tentativePlayerIds || []),
      ];

      const available = TEAM_ROSTER_25.find((p) => !allRegistered.includes(p.id));
      if (available) {
        votePoll(messageId, 'confirm', available.id);
      }
    },
    [messages, votePoll]
  );

  // Toggle emoji reaction
  const toggleReaction = useCallback(
    (messageId: string, emoji: string) => {
      const playerId = currentSender.id;

      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id !== messageId) return msg;
          const reactions = { ...(msg.reactions || {}) };
          const currentList = reactions[emoji] || [];

          if (currentList.includes(playerId)) {
            reactions[emoji] = currentList.filter((id) => id !== playerId);
            if (reactions[emoji].length === 0) {
              delete reactions[emoji];
            }
          } else {
            reactions[emoji] = [...currentList, playerId];
          }

          return { ...msg, reactions };
        })
      );

      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            type: 'chat:reaction',
            messageId,
            emoji,
            playerId,
          })
        );
      }

      const targetMsg = messages.find((m) => m.id === messageId);
      if (targetMsg && broadcastChannelRef.current) {
        const reactions = { ...(targetMsg.reactions || {}) };
        const currentList = reactions[emoji] || [];
        if (currentList.includes(playerId)) {
          reactions[emoji] = currentList.filter((id) => id !== playerId);
          if (reactions[emoji].length === 0) delete reactions[emoji];
        } else {
          reactions[emoji] = [...currentList, playerId];
        }
        broadcastChannelRef.current.postMessage({
          type: 'chat:reaction_updated',
          payload: { messageId, reactions },
        });
      }
    },
    [currentSender.id, messages]
  );

  return {
    messages,
    channelMessages: messages.filter((m) => m.channel === activeChannel),
    activeChannel,
    setActiveChannel,
    isConnected,
    onlineUsers,
    sendMessage,
    votePoll,
    simulateStarterApology,
    simulateWaitlistJoin,
    toggleReaction,
  };
}
