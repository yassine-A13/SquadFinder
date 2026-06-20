export type UserRole = "PLAYER" | "ADMIN";

export type Announcement = {
  id: string;
  title: string;
  location: string;
  level: string;
  game: string;
  slotsOpen: number;
};

export type ActionResult<T = void> = {
  ok: boolean;
  message: string;
  data?: T;
};
