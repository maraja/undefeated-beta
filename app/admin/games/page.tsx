'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { Player, Team, Session, Game } from '../../dto/types';

export default function ManageGames() {
  const isAdmin = useAdminAuth();

  if (!isAdmin) {
    return null; // or a loading indicator
  }

  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [editingGameId, setEditingGameId] = useState<number | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    const response = await fetch('/api/sessions');
    if (response.ok) {
      const data = await response.json();
      setSessions(data.sessions);
    }
  };

  const fetchSessionPlayers = async (sessionId: number) => {
    const response = await fetch(`/api/sessions/${sessionId}/players`);
    if (response.ok) {
      const data = await response.json();
      setAvailablePlayers(data.players);
    }
  };

  const fetchGames = async (sessionId: number) => {
    const response = await fetch(`/api/admin/games?sessionId=${sessionId}`);
    if (response.ok) {
      const data = await response.json();
      setGames(data.games);
    }
  };

  const handleSessionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sessionId = parseInt(e.target.value);
    setSelectedSession(sessionId);
    fetchSessionPlayers(sessionId);
    fetchGames(sessionId);
  };

  const onDragEnd = (result: DropResult, gameIndex: number) => {
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    const newGames = [...games];
    const currentGame = newGames[gameIndex];

    if (source.droppableId === destination.droppableId) {
      // Reordering within the same team
      const teamIndex = currentGame.teams.findIndex(team => team.id.toString() === source.droppableId);
      const newPlayers = Array.from(currentGame.teams[teamIndex].players);
      const [reorderedItem] = newPlayers.splice(source.index, 1);
      newPlayers.splice(destination.index, 0, reorderedItem);
      currentGame.teams[teamIndex].players = newPlayers;
    } else {
      // Moving between teams or from available players
      const sourceTeamIndex = source.droppableId === 'available' 
        ? -1 
        : currentGame.teams.findIndex(team => team.id.toString() === source.droppableId);
      const destTeamIndex = destination.droppableId === 'available'
        ? -1
        : currentGame.teams.findIndex(team => team.id.toString() === destination.droppableId);

      const sourceList = sourceTeamIndex === -1 ? availablePlayers : currentGame.teams[sourceTeamIndex].players;
      const destList = destTeamIndex === -1 ? availablePlayers : currentGame.teams[destTeamIndex].players;

      const [movedItem] = sourceList.splice(source.index, 1);
      destList.splice(destination.index, 0, movedItem);

      if (sourceTeamIndex === -1) {
        setAvailablePlayers(sourceList);
      } else {
        currentGame.teams[sourceTeamIndex].players = sourceList;
      }

      if (destTeamIndex === -1) {
        setAvailablePlayers(destList);
      } else {
        currentGame.teams[destTeamIndex].players = destList;
      }
    }

    setGames(newGames);
  };

  const handleCreateGame = async () => {
    if (!selectedSession) return;

    const newGame: Game = {
      id: Date.now(), // Temporary ID
      teams: [
        { id: Date.now() + 1, name: 'Team 1', players: [] },
        { id: Date.now() + 2, name: 'Team 2', players: [] },
      ],
      winnerId: null,
      sessionId: selectedSession,
    };

    setGames([...games, newGame]);
  };

  const handleSubmitGame = async (gameIndex: number, winnerId: number) => {
    if (!selectedSession) return;

    const game = games[gameIndex];
    const url = game.id ? `/api/admin/games/${game.id}` : '/api/admin/games';
    const method = game.id ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: selectedSession,
        teams: game.teams,
        winnerId,
      }),
    });

    if (response.ok) {
      alert(game.id ? 'Game updated successfully!' : 'Game submitted successfully!');
      fetchGames(selectedSession);
    } else {
      alert('Error submitting game');
    }
  };

  const handleDeleteGame = async (gameId: number) => {
    if (confirm('Are you sure you want to delete this game?')) {
      const response = await fetch(`/api/admin/games/${gameId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Game deleted successfully!');
        fetchGames(selectedSession!);
      } else {
        alert('Error deleting game');
      }
    }
  };

  const calculateSessionSummary = (sessionGames: Game[]) => {
    const totalGames = sessionGames.length;
    const totalPlayers = new Set(sessionGames.flatMap(game => game.teams.flatMap(team => team.players.map(player => player.id)))).size;
    const winningTeams = sessionGames.filter(game => game.winnerId !== null).length;

    return {
      totalGames,
      totalPlayers,
      winningTeams,
    };
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 bg-gray-900 text-gray-200 p-6 rounded-lg">
      <h1 className="text-3xl font-bold mb-6">Manage Games</h1>
      <select
        value={selectedSession || ''}
        onChange={handleSessionChange}
        className="mb-4 p-2 border rounded bg-gray-800 text-gray-200 border-gray-700"
      >
        <option value="">Select Session</option>
        {sessions.map((session) => (
          <option key={session.id} value={session.id}>
            {new Date(session.date).toLocaleDateString()} - {session.time} - {session.location}
          </option>
        ))}
      </select>

      {selectedSession && (
        <>
          <button
            onClick={handleCreateGame}
            className="mb-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Create New Game
          </button>

          {games.length > 0 && (
            <div className="mb-8 bg-gray-800 p-4 rounded text-gray-200">
              <h2 className="text-xl font-bold mb-2">Session Summary</h2>
              {(() => {
                const summary = calculateSessionSummary(games);
                return (
                  <ul className="text-gray-200">
                    <li>Total Games: {summary.totalGames}</li>
                    <li>Total Players: {summary.totalPlayers}</li>
                    <li>Games with Winners: {summary.winningTeams}</li>
                  </ul>
                );
              })()}
            </div>
          )}

          <div className="grid grid-cols-1 gap-8">
            {games.map((game, gameIndex) => (
              <div key={game.id} className="bg-gray-800 p-4 rounded">
                <h2 className="text-xl font-bold mb-4">Game {gameIndex + 1}</h2>
                <DragDropContext onDragEnd={(result) => onDragEnd(result, gameIndex)}>
                  <div className="grid grid-cols-3 gap-4">
                    <Droppable droppableId="available">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="bg-gray-700 p-4 rounded shadow"
                        >
                          <h3 className="text-lg font-semibold mb-2">Available Players</h3>
                          {availablePlayers.map((player, index) => (
                            <Draggable key={player.id} draggableId={player.id.toString()} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="bg-gray-600 p-2 mb-2 rounded"
                                >
                                  {player.name}
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>

                    {game.teams.map((team) => (
                      <Droppable key={team.id} droppableId={team.id.toString()}>
                        {(provided) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className={`bg-gray-700 p-4 rounded shadow ${
                              game.winnerId === team.id ? 'border-4 border-green-500' : ''
                            }`}
                          >
                            <h3 className="text-lg font-semibold mb-2">
                              {team.name}
                              {game.winnerId === team.id && (
                                <span className="ml-2 text-green-500">(Winner)</span>
                              )}
                            </h3>
                            {team.players.map((player, index) => (
                              <Draggable key={player.id} draggableId={player.id.toString()} index={index}>
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="bg-gray-600 p-2 mb-2 rounded"
                                  >
                                    {player.name}
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                            <button
                              onClick={() => handleSubmitGame(gameIndex, team.id)}
                              className={`mt-4 px-4 py-2 rounded w-full ${
                                game.winnerId === team.id
                                  ? 'bg-green-600 hover:bg-green-700 text-white'
                                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                              }`}
                            >
                              {game.winnerId === team.id ? 'Current Winner' : 'Mark as Winner'}
                            </button>
                          </div>
                        )}
                      </Droppable>
                    ))}
                  </div>
                </DragDropContext>
                <button
                  onClick={() => handleDeleteGame(game.id)}
                  className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                >
                  Delete Game
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

