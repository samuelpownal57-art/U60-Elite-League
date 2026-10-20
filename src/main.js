import './style.css';
import { supabase } from './supabase.js';

document.querySelector('#app').innerHTML = `
  <header class="header">
    <h1>🏒 U60 Elite League</h1>
    <p>Every goal and assist counts.</p>
  </header>

  <main class="container">
    <section class="card">
      <h2>Admin Account</h2>

      <div id="signed-out">
        <form id="login-form">
          <label for="email">Email</label>
          <input id="email" type="email" required placeholder="Your email">

          <label for="password">Password</label>
          <input id="password" type="password" required placeholder="Your password">

          <button type="submit">Sign In</button>
        </form>
      </div>

      <div id="signed-in" hidden>
        <p id="account-status"></p>
        <button id="sign-out-button" type="button">Sign Out</button>
      </div>

      <p id="login-status" role="status"></p>
    </section>

    <section class="card" id="game-entry-card" hidden>
  <h2>🏒 Enter Game Statistics</h2>

  <form id="game-form">
    <label for="game-date">Game Date</label>
    <input id="game-date" type="date" required>

    <label for="opponent">Opponent</label>
    <input id="opponent" type="text" required placeholder="Opponent's team">

    <button type="submit">Create Game</button>
    <p id="game-status" role="status"></p>
  </form>
</section>
<section class="card">
  <h2>📊 Enter Player Statistics</h2>

  <form id="stats-form">
    <label for="stats-game">Game</label>
    <select id="stats-game" required>
      <option value="">Select a game</option>
    </select>

    <label for="stats-player">Player</label>
    <select id="stats-player" required>
      <option value="">Select a player</option>
    </select>

    <label for="stats-goals">Goals</label>
    <input id="stats-goals" type="number" min="0" value="0" required>

    <label for="stats-assists">Assists</label>
    <input id="stats-assists" type="number" min="0" value="0" required>

    <button type="submit">Save Player Statistics</button>
    <p id="stats-status" role="status"></p>
  </form>
</section>
<section class="card" id="stats-entry-card">
      <h2>🏆 Team Leaderboard</h2>
      <p id="status">Loading players...</p>

      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>GP</th>
              <th>G</th>
              <th>A</th>
              <th>PTS</th>
            </tr>
          </thead>
          <tbody id="leaderboard"></tbody>
        </table>
      </div>
    </section>
  </main>
`;

const loginForm = document.querySelector('#login-form');
const loginStatus = document.querySelector('#login-status');
const signedOut = document.querySelector('#signed-out');
const signedIn = document.querySelector('#signed-in');
const accountStatus = document.querySelector('#account-status');

async function updateLoginDisplay() {
  const { data: { session } } = await supabase.auth.getSession();

  signedOut.hidden = Boolean(session);
  signedIn.hidden = !session;
document.querySelector('#game-entry-card').hidden = !session;
  document.getElementById('stats-entry-card').hidden = !session;
  if (session) {
    accountStatus.textContent = `Signed in as ${session.user.email}`;
  }
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  loginStatus.textContent = 'Signing in...';

  const email = document.querySelector('#email').value;
  const password = document.querySelector('#password').value;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    loginStatus.textContent = 'Login failed: ' + error.message;
    return;
  }

  loginStatus.textContent = 'Signed in successfully!';
  loginForm.reset();

  await updateLoginDisplay();
});

document.querySelector('#sign-out-button').addEventListener('click', async () => {
  loginStatus.textContent = 'Signing out...';

  const { error } = await supabase.auth.signOut();

  if (error) {
    loginStatus.textContent = 'Sign-out failed: ' + error.message;
    return;
  }

  loginStatus.textContent = 'You have signed out.';
  await updateLoginDisplay();
});

supabase.auth.onAuthStateChange(() => {
  updateLoginDisplay();
});
document.querySelector('#game-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const status = document.querySelector('#game-status');
  status.textContent = 'Saving game...';

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    status.textContent = 'Please sign in before creating a game.';
    return;
  }

  const game_date = document.querySelector('#game-date').value;
  const opponent = document.querySelector('#opponent').value.trim();

  const { error } = await supabase
    .from('games')
    .insert([{ game_date, opponent }]);

  if (error) {
    status.textContent = 'Could not save game: ' + error.message;
    return;
  }

  status.textContent = 'Game created successfully!';

  document.querySelector('#game-form').reset();
});
async function loadGameAndPlayerOptions() {
  const gameSelect = document.querySelector('#stats-game');
  const playerSelect = document.querySelector('#stats-player');
  const status = document.querySelector('#stats-status');

  const { data: games, error: gamesError } = await supabase
    .from('games')
    .select('id, game_date, opponent')
    .order('game_date', { ascending: false });

  if (gamesError) {
    status.textContent = 'Could not load games: ' + gamesError.message;
    return;
  }

  gameSelect.innerHTML = '<option value="">Select a game</option>';

  games.forEach((game) => {
    const option = document.createElement('option');
    option.value = game.id;
    option.textContent = `${game.game_date} - ${game.opponent}`;
    gameSelect.appendChild(option);
  });

  const { data: players, error: playersError } = await supabase
    .from('players')
    .select('id, name')
    .order('name');

  if (playersError) {
    status.textContent = 'Could not load players: ' + playersError.message;
    return;
  }

  playerSelect.innerHTML = '<option value="">Select a player</option>';

  players.forEach((player) => {
    const option = document.createElement('option');
    option.value = player.id;
    option.textContent = player.name;
    playerSelect.appendChild(option);
  });
}
document.querySelector('#stats-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const status = document.querySelector('#stats-status');
  status.textContent = 'Saving statistics...';

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    status.textContent = 'Please sign in before saving statistics.';
    return;
  }

  const game_id = document.querySelector('#stats-game').value;
  const player_id = document.querySelector('#stats-player').value;
  const goals = Number(document.querySelector('#stats-goals').value);
  const assists = Number(document.querySelector('#stats-assists').value);

  if (!game_id || !player_id) {
    status.textContent = 'Please select a game and a player.';
    return;
  }

  const { error } = await supabase
    .from('player_game_stats')
    .upsert(
      [{ game_id, player_id, goals, assists }],
      { onConflict: 'player_id,game_id' }
    );

  if (error) {
    status.textContent = 'Could not save statistics: ' + error.message;
    return;
  }

  status.textContent = 'Statistics saved successfully!';

  document.querySelector('#stats-form').reset();

  await loadLeaderboard();
  await loadGameAndPlayerOptions();
});
async function loadLeaderboard() {
  const status = document.querySelector('#status');
  const table = document.querySelector('#leaderboard');

  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .order('points', { ascending: false });

  if (error) {
    status.textContent = 'Could not load leaderboard: ' + error.message;
    return;
  }

  if (!data || data.length === 0) {
    status.textContent = 'No player statistics yet.';
    return;
  }

  status.textContent = '';

  table.innerHTML = data.map((player, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${player.name}</td>
      <td>${player.games_played}</td>
      <td>${player.goals}</td>
      <td>${player.assists}</td>
      <td><strong>${player.points}</strong></td>
    </tr>
  `).join('');
}

updateLoginDisplay();
loadLeaderboard();
loadGameAndPlayerOptions();
