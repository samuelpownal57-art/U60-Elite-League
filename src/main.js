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
</section><section class="card">
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
