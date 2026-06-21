"use client";

import { useEffect } from "react";

import { createPusherClient } from "@/lib/pusher/client";

type UseConversationOptions = {
  conversationId?: string;
  onNewMessage?: (payload: unknown) => void;
  onMessageRead?: (payload: unknown) => void;
};

export function useConversation({
  conversationId,
  onNewMessage,
  onMessageRead,
}: UseConversationOptions) {
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

    channel.bind("new-message", (event: unknown) => {
      onNewMessage?.(event);
    });

    channel.bind("message-read", (event: unknown) => {
      onMessageRead?.(event);
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(channelName);
    };
  }, [conversationId, onMessageRead, onNewMessage]);
}
