"use client";

import { useEffect, useRef } from "react";

import { createPusherClient } from "@/lib/pusher/client";

type UseConversationOptions = {
  conversationId?: string;
  onNewMessage?: (payload: unknown) => void;
  onMessageRead?: (payload: unknown) => void;
};

const channelSubscribers = new Map<string, number>();

export function useConversation({
  conversationId,
  onNewMessage,
  onMessageRead,
}: UseConversationOptions) {
  const onNewMessageRef = useRef(onNewMessage);
  const onMessageReadRef = useRef(onMessageRead);

  useEffect(() => {
    onNewMessageRef.current = onNewMessage;
    onMessageReadRef.current = onMessageRead;
  }, [onMessageRead, onNewMessage]);

  useEffect(() => {
    if (!conversationId) {
      return;
    }

    const channelName = `private-conversation-${conversationId}`;
    const pusher = createPusherClient();

    if (!pusher) {
      return;
    }

    const channel = pusher.subscribe(channelName);
    channelSubscribers.set(channelName, (channelSubscribers.get(channelName) ?? 0) + 1);

    const handleNewMessage = (event: unknown) => onNewMessageRef.current?.(event);
    const handleMessageRead = (event: unknown) => onMessageReadRef.current?.(event);

    channel.bind("new-message", handleNewMessage);
    channel.bind("message-read", handleMessageRead);

    return () => {
      channel.unbind("new-message", handleNewMessage);
      channel.unbind("message-read", handleMessageRead);

      const remainingSubscribers = (channelSubscribers.get(channelName) ?? 1) - 1;
      if (remainingSubscribers <= 0) {
        channelSubscribers.delete(channelName);
        pusher.unsubscribe(channelName);
      } else {
        channelSubscribers.set(channelName, remainingSubscribers);
      }
    };
  }, [conversationId]);
}
