import './style.css';
import { supabase } from './supabase.js';

document.querySelector('#app').innerHTML = `
  <header class="header">
    <h1>🏒 U60 Elite League</h1>
    <p>Every goal and assist counts.</p>
  </header>

  <main class="container">
    <section class="card">
      <h2>🏆 Leaderboard</h2>
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
