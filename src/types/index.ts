export type UserRole = "PLAYER" | "ADMIN";

export type Announcement = {
  id: string;
  title: string;
  description: string;
  city: string;
  matchDate: string;
  matchTime: string;
  level: string;
  game: string;
  slotsOpen: number;
  type: "TEAM_LOOKING_PLAYER" | "PLAYER_LOOKING_TEAM";
  status: "OPEN" | "CLOSED";
  createdAt: string;
  applicationsCount: number;
  author: {
    id: string;
    name: string;
    image: string | null;
    city: string | null;
  };
};

export type ActionResult<T = void> = {
  ok: boolean;
  message: string;
  data?: T;
};

export type PostSortOption = "recent" | "matchDate" | "popular";
