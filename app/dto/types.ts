export interface Season {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
  }
  
  export interface User {
    id: string;
    name: string;
    email: string;
    isAdmin: boolean;
    points?: number;
    gamesPlayed?: number;
    winRate?: number;
    position?: string;
    avatarUrl?: string;
    seasons: Season[];
  }
  
  export interface Player {
    id: number;
    name: string;
    email: string;
    points: number;
    gamesPlayed: number;
    winRate: number;
    position: string;
    bio: string;
    avatarUrl: string;
  }
  
  export interface Session {
    id: number;
    date: string;
    time: string;
    location: string;
    seasonId: number;
    games: Game[];
  }
  
  export interface Team {
    id: number;
    name: string;
    players: Player[];
  }
  
  export interface Game {
    id: number;
    sessionId: number;
    teams: Team[];
    winnerId: number | null;
  }
  
  export interface InviteCode {
    id: number;
    code: string;
    isUsed: boolean;
    seasonId: number;
  }
  
  export interface PlayerSession {
    playerId: number;
    sessionId: number;
  }
  
  export interface PlayerTeam {
    playerId: number;
    teamId: number;
  }
  
  export interface SessionWithPlayers extends Session {
    players: Player[];
  }
  
  export interface GameWithTeams extends Game {
    teams: TeamWithPlayers[];
  }
  
  export interface TeamWithPlayers extends Team {
    players: Player[];
  }
  
  export interface AuthToken {
    id: number;
    email: string;
    isAdmin: boolean;
    iat: number;
    exp: number;
  }
  