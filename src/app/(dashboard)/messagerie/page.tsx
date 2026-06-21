"use client";

import { useEffect, useMemo, useState } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useConversation } from "@/hooks/useConversation";
import type { ConversationItem, MessageItem } from "@/server/actions/messages";
import { sendMessage } from "@/server/actions/messages";

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

  const conversationsQuery = useQuery({
    queryKey: ["conversations"],
    queryFn: fetchConversations,
  });

  const messagesQuery = useQuery({
    queryKey: ["conversation-messages", selectedConversationId],
    queryFn: () => fetchMessages(selectedConversationId ?? ""),
    enabled: Boolean(selectedConversationId),
  });

  useConversation({
    conversationId: selectedConversationId ?? undefined,
    onNewMessage: (payload) => {
      queryClient.invalidateQueries({ queryKey: ["conversation-messages", selectedConversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onMessageRead: () => {
      queryClient.invalidateQueries({ queryKey: ["conversation-messages", selectedConversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  useEffect(() => {
    if (!selectedConversationId) {
      return;
    }

    void fetch(`/api/conversations/${selectedConversationId}/read`, {
      method: "POST",
    });
  }, [selectedConversationId]);

  const selectedConversation = useMemo(
    () =>
      conversationsQuery.data?.find((conversation) => conversation.id === selectedConversationId) ?? null,
    [conversationsQuery.data, selectedConversationId],
  );

  const handleSend = async () => {
    if (!selectedConversationId || !messageContent.trim()) {
      return;
    }

    await sendMessage({ conversationId: selectedConversationId, content: messageContent.trim() });
    setMessageContent("");
    queryClient.invalidateQueries({ queryKey: ["conversation-messages", selectedConversationId] });
    queryClient.invalidateQueries({ queryKey: ["conversations"] });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
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
                  {messagesQuery.data?.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`rounded-2xl p-3 ${
                        message.sender.id === selectedConversation.interlocutor.id
                          ? "bg-muted text-foreground"
                          : "bg-primary text-primary-foreground self-end"
                      } max-w-[80%]`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {new Date(message.createdAt).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t border-border p-4">
                <div className="flex gap-2">
                  <Input
                    value={messageContent}
                    onChange={(event) => setMessageContent(event.target.value)}
                    placeholder="Ecrire un message..."
                  />
                  <Button onClick={handleSend} type="button">
                    Envoyer
                  </Button>
                </div>
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
