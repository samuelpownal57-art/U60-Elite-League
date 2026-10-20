import './style.css';
import { supabase } from './supabase.js';

document.querySelector('#app').innerHTML = `
  <header class="header">
    <h1>🏒 U60 Elite League</h1>
    <p>Every goal and assist counts.</p>
  </header>

  <main class="container">
    <section class="card" id="login-card">
      <h2>Admin Login</h2>
      <p>Sign in to manage league statistics.</p>

      <form id="login-form">
        <label for="email">Email</label>
        <input id="email" type="email" required placeholder="Your email">

        <label for="password">Password</label>
        <input id="password" type="password" required placeholder="Your password">

        <button type="submit">Sign In</button>
        <p id="login-status" role="status"></p>
      </form>
    </section>

    <section class="card">
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

document.querySelector('#login-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const status = document.querySelector('#login-status');
  status.textContent = 'Signing in...';

  const email = document.querySelector('#email').value;
  const password = document.querySelector('#password').value;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    status.textContent = 'Login failed: ' + error.message;
    return;
  }

  status.textContent = 'Signed in successfully!';
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

loadLeaderboard();
