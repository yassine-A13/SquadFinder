"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useConversation } from "@/hooks/useConversation";
import type { ConversationItem, MessageItem } from "@/server/actions/messages";
import { markAsRead, sendMessage } from "@/server/actions/messages";

type NewMessageEvent = {
  message?: {
    conversationId?: string;
  };
};

function ConversationSubscription({
  conversationId,
  active,
  onEvent,
}: {
  conversationId: string;
  active: boolean;
  onEvent: (conversationId: string) => void;
}) {
  useConversation({
    conversationId,
    onNewMessage: (payload) => {
      const event = payload as NewMessageEvent;
      const eventConversationId = event.message?.conversationId ?? conversationId;
      onEvent(eventConversationId);
      if (active) {
        void markAsRead(conversationId);
      }
    },
    onMessageRead: () => onEvent(conversationId),
  });

  return null;
}

async function fetchConversations() {
  const response = await fetch("/api/conversations");
  if (!response.ok) {
    throw new Error("Impossible de charger les conversations.");
  }
  return (await response.json()) as ConversationItem[];
}

async function fetchMessages(conversationId: string) {
  const response = await fetch(`/api/conversations/${conversationId}/messages`);
  if (!response.ok) {
    throw new Error("Impossible de charger l'historique des messages.");
  }
  return (await response.json()) as { messages: MessageItem[]; hasMore: boolean };
}

export default function MessageriePage() {
  const queryClient = useQueryClient();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messageContent, setMessageContent] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);
  const directLinkResolved = useRef(false);

  const conversationsQuery = useQuery({
    queryKey: ["conversations"],
    queryFn: fetchConversations,
  });

  const messagesQuery = useQuery({
    queryKey: ["conversation-messages", selectedConversationId],
    queryFn: () => fetchMessages(selectedConversationId ?? ""),
    enabled: Boolean(selectedConversationId),
  });

  useEffect(() => {
    if (directLinkResolved.current || !conversationsQuery.data) {
      return;
    }

    directLinkResolved.current = true;
    const params = new URLSearchParams(window.location.search);
    const conversationId = params.get("conversation");
    const applicationId = params.get("application");

    if (conversationId && conversationsQuery.data.some((item) => item.id === conversationId)) {
      setSelectedConversationId(conversationId);
      return;
    }

    if (applicationId) {
      void fetch(`/api/conversations/by-application?applicationId=${encodeURIComponent(applicationId)}`)
        .then((response) => (response.ok ? response.json() : null))
        .then((result: { conversationId?: string } | null) => {
          if (result?.conversationId) setSelectedConversationId(result.conversationId);
        });
      return;
    }

    setSelectedConversationId(conversationsQuery.data[0]?.id ?? null);
  }, [conversationsQuery.data]);

  useEffect(() => {
    if (!selectedConversationId) {
      return;
    }

    void markAsRead(selectedConversationId).then(() => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    });
  }, [queryClient, selectedConversationId]);

  const selectedConversation = useMemo(
    () =>
      conversationsQuery.data?.find((conversation) => conversation.id === selectedConversationId) ?? null,
    [conversationsQuery.data, selectedConversationId],
  );

  const refreshConversation = (conversationId: string) => {
    queryClient.invalidateQueries({ queryKey: ["conversation-messages", conversationId] });
    queryClient.invalidateQueries({ queryKey: ["conversations"] });
  };

  const handleSend = async (event?: FormEvent) => {
    event?.preventDefault();
    if (!selectedConversationId || !messageContent.trim()) {
      return;
    }

    setSendError(null);
    const result = await sendMessage(selectedConversationId, messageContent);
    if (!result.ok) {
      setSendError(result.message);
      return;
    }
    setMessageContent("");
    refreshConversation(selectedConversationId);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
      {conversationsQuery.data?.map((conversation) => (
        <ConversationSubscription
          active={conversation.id === selectedConversationId}
          conversationId={conversation.id}
          key={`subscription-${conversation.id}`}
          onEvent={refreshConversation}
        />
      ))}
      <Card className="h-[calc(100vh-170px)] overflow-hidden">
        <CardHeader>
          <CardTitle>Conversations</CardTitle>
        </CardHeader>
        <CardContent className="h-full overflow-y-auto p-0">
          {conversationsQuery.isLoading ? (
            <div className="p-6 text-sm text-muted-foreground">Chargement des conversations...</div>
          ) : (
            <div className="space-y-2">
              {conversationsQuery.data?.map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => setSelectedConversationId(conversation.id)}
                  className={`flex w-full items-center gap-3 border-b border-border/80 px-4 py-4 text-left transition hover:bg-muted ${
                    selectedConversationId === conversation.id ? "bg-muted" : ""
                  }`}
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={conversation.interlocutor.image ?? undefined} alt={conversation.interlocutor.name} />
                    <AvatarFallback>{conversation.interlocutor.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">{conversation.interlocutor.name}</p>
                      {conversation.unreadCount > 0 ? (
                        <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
                          {conversation.unreadCount}
                        </span>
                      ) : null}
                    </div>
                    <p className="truncate text-sm text-muted-foreground">
                      {conversation.lastMessage?.content ?? "Aucun message."}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="h-[calc(100vh-170px)] overflow-hidden">
        <CardHeader>
          <CardTitle>Discussion</CardTitle>
        </CardHeader>
        <CardContent className="flex h-full flex-col gap-4 p-0">
          {selectedConversation ? (
            <div className="flex h-full flex-col">
              <div className="border-b border-border px-4 py-3">
                <p className="font-semibold">{selectedConversation.interlocutor.name}</p>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className="space-y-3">
                  {messagesQuery.data?.messages.map((message) => {
                    const received = message.sender.id === selectedConversation.interlocutor.id;
                    return (
                    <div className={`flex ${received ? "justify-start" : "justify-end"}`} key={message.id}>
                      <div
                        className={`max-w-[80%] rounded-2xl p-3 ${
                          received ? "bg-muted text-foreground" : "bg-primary text-primary-foreground"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p>
                        <p className={`mt-2 text-xs ${received ? "text-muted-foreground" : "text-primary-foreground/70"}`}>
                          {new Date(message.createdAt).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
              <div className="border-t border-border p-4">
                <form className="flex gap-2" onSubmit={handleSend}>
                  <Input
                    maxLength={4000}
                    value={messageContent}
                    onChange={(event) => setMessageContent(event.target.value)}
                    placeholder="Ecrire un message..."
                  />
                  <Button type="submit">
                    Envoyer
                  </Button>
                </form>
                {sendError ? <p className="mt-2 text-sm text-destructive">{sendError}</p> : null}
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
              Selectionnez une conversation pour commencer a echanger.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
