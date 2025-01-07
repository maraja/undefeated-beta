import { NextApiRequest } from 'next';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: number;
    email: string;
    isAdmin: boolean;
  };
}

export interface Season {
  id: number;
  name: string;
  start_date: Date;
  end_date: Date;
}

export interface Player {
  id: number;
  name: string;
  email: string;
  password: string;
  points: number;
  games_played: number;
  win_rate: number;
  position: string;
  bio: string;
  avatar_url: string;
  is_admin: boolean;
}

export interface Session {
  id: number;
  date: Date;
  time: string;
  location: string;
  season_id: number;
}

export interface Game {
  id: number;
  session_id: number;
  winner_id: number | null;
}

export interface Team {
  id: number;
  game_id: number;
  name: string;
}

export interface InviteCode {
  id: number;
  code: string;
  is_used: boolean;
  season_id: number;
}

export interface PlayerSession {
  player_id: number;
  session_id: number;
}

export interface PlayerTeam {
  player_id: number;
  team_id: number;
}

export interface LeaderboardEntry {
  id: number;
  name: string;
  points: number;
  games_played: number;
  win_rate: number;
  position: string;
  avatar_url: string;
}

export interface SessionSummary {
  totalGames: number;
  totalPlayers: number;
  winningTeams: number;
}

export interface CreateGameInput {
  sessionId: number;
  teams: {
    name: string;
    playerIds: number[];
  }[];
}

export interface UpdateGameInput {
  id: number;
  teams: {
    id: number;
    name: string;
    playerIds: number[];
  }[];
  winnerId?: number;
}

export interface CreateSessionInput {
  date: string;
  time: string;
  location: string;
  seasonId: number;
}

export interface UpdateSessionInput extends CreateSessionInput {
  id: number;
}

export interface CreateSeasonInput {
  name: string;
  startDate: string;
  endDate: string;
}

export interface UpdateSeasonInput extends CreateSeasonInput {
  id: number;
}

export interface CreateInviteCodeInput {
  seasonId: number;
}

export interface RegisterPlayerInput {
  name: string;
  email: string;
  password: string;
  inviteCode: string;
}

export interface UpdateProfileInput {
  name: string;
  position: string;
  bio: string;
}

export interface EnrollPlayerInput {
  sessionId: number;
  playerId: number;
}

