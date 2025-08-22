// widget.js

function createWidget(container) {
    const FIXTURE_ID = container.getAttribute("data-fixture");
    const LEAGUE = container.getAttribute("data-league") || "eng.1";
    const API_URL = `https://love-weld-nine.vercel.app/api/espn?league=${LEAGUE}&id=${FIXTURE_ID}`;
    const CACHE_KEY = `fixture_${LEAGUE}_${FIXTURE_ID}`;
    const CACHE_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 days

    // Inject skeleton with ALL sections (ads included)
    container.innerHTML = `
        <div class="fw-loading">Loading match data...</div>
        <div class="fw-content" style="display: none;">
            
            <!-- AdSense 1 -->
            <div style="text-align: center; margin: 20px 0;">
                <ins class="adsbygoogle"
                     style="display:block"
                     data-ad-client="ca-pub-2485970459707316"
                     data-ad-slot="7957136821"
                     data-ad-format="auto"
                     data-full-width-responsive="true"></ins>
            </div>

            <!-- Recent Form -->
            <div class="card">
                <div class="card-header form-header"><span>📈 Recent Form (Last 5 Matches)</span></div>
                <div class="card-content"><div class="fw-recent-form team-grid"></div></div>
            </div>

            <!-- Head-to-Head -->
            <div class="card">
                <div class="card-header h2h-header"><span>📊 Head-to-Head Record</span></div>
                <div class="card-content">
                    <div class="fw-h2h-summary h2h-summary"></div>
                    <div class="fw-h2h-matches"></div>
                </div>
            </div>

            <!-- AdSense 2 -->
            <div style="text-align: center; margin: 20px 0;">
                <ins class="adsbygoogle"
                     style="display:block"
                     data-ad-client="ca-pub-2485970459707316"
                     data-ad-slot="2737166010"
                     data-ad-format="auto"
                     data-full-width-responsive="true"></ins>
            </div>

            <!-- Team Statistics -->
            <div class="card">
                <div class="card-header stats-header"><span>📋 Team Statistics Comparison</span></div>
                <div class="card-content"><div class="fw-team-statistics stats-grid"></div></div>
            </div>

            <!-- Venue -->
            <div class="card">
                <div class="card-header venue-header"><span>🏟️ Venue Information</span></div>
                <div class="card-content"><div class="fw-venue-info"></div></div>
            </div>

            <!-- AdSense 3 -->
            <div style="text-align: center; margin: 20px 0;">
                <ins class="adsbygoogle"
                     style="display:block"
                     data-ad-client="ca-pub-2485970459707316"
                     data-ad-slot="3657034432"
                     data-ad-format="auto"
                     data-full-width-responsive="true"></ins>
            </div>
        </div>
    `;

    // === Utility functions ===
    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    }

    function getResultBadge(result) {
        const classes = { 'W': 'badge badge-win','L': 'badge badge-loss','D': 'badge badge-draw' };
        return classes[result] || 'badge';
    }

    function getResultColor(result) {
        const colors = { 'W': '#166534','L': '#dc2626','D': '#d97706' };
        return colors[result] || '#64748b';
    }

    // === Render functions ===
    function renderRecentForm(form) {
        const containerEl = container.querySelector('.fw-recent-form');
        containerEl.innerHTML = '';
        form.forEach(teamForm => {
            const teamDiv = document.createElement('div');
            teamDiv.className = 'team-section';
            const teamInfo = `
                <div class="team-info">
                    <img src="${teamForm.team.logo}" alt="${teamForm.team.displayName}" class="team-logo">
                    <div>
                        <div class="team-name">${teamForm.team.displayName}</div>
                        <div class="form-badges">
                            ${teamForm.events.slice(0,5).map(event =>
                                `<span class="${getResultBadge(event.gameResult)}">${event.gameResult}</span>`
                            ).join('')}
                        </div>
                    </div>
                </div>
            `;
            const matches = `
                <div class="match-list">
                    ${teamForm.events.slice(0,5).map(event => `
                        <div class="match-item">
                            <div class="match-header">
                                <div class="opponent-info">
                                    <img src="${event.opponentLogo}" alt="${event.opponent.displayName}" class="opponent-logo">
                                    <div>
                                        <div>${event.atVs === '@' ? '@ ' : 'vs '}${event.opponent.displayName}</div>
                                        <div class="match-date">${formatDate(event.gameDate)} • ${event.leagueAbbreviation || event.leagueName}</div>
                                    </div>
                                </div>
                                <div class="match-result">
                                    <div class="score" style="color:${getResultColor(event.gameResult)}">${event.gameResult} ${event.score}</div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            teamDiv.innerHTML = teamInfo + matches;
            containerEl.appendChild(teamDiv);
        });
    }

    function renderHeadToHead(headToHeadGames, teams) {
        const summaryContainer = container.querySelector('.fw-h2h-summary');
        const matchesContainer = container.querySelector('.fw-h2h-matches');
        let team1Wins = 0, team2Wins = 0, draws = 0, allMatches = [];
        if (headToHeadGames?.length) {
            const team1Id = teams[0]?.team.id, team2Id = teams[1]?.team.id;
            headToHeadGames.forEach(game => {
                game.events?.forEach(event => {
                    allMatches.push(event);
                    const homeScore = +event.homeTeamScore, awayScore = +event.awayTeamScore;
                    if (homeScore > awayScore) {
                        if (event.homeTeamId === team1Id) team1Wins++;
                        else if (event.homeTeamId === team2Id) team2Wins++;
                    } else if (awayScore > homeScore) {
                        if (event.awayTeamId === team1Id) team1Wins++;
                        else if (event.awayTeamId === team2Id) team2Wins++;
                    } else { draws++; }
                });
            });
        }
        summaryContainer.innerHTML = `
            <div class="h2h-stat"><div class="h2h-number">${team1Wins}</div><div class="h2h-label">${teams[0]?.team.displayName || 'Team 1'} Wins</div></div>
            <div class="h2h-stat"><div class="h2h-number">${draws}</div><div class="h2h-label">Draws</div></div>
            <div class="h2h-stat"><div class="h2h-number">${team2Wins}</div><div class="h2h-label">${teams[1]?.team.displayName || 'Team 2'} Wins</div></div>
        `;
        if (allMatches.length) {
            matchesContainer.innerHTML = `
                <h3 style="margin-bottom:16px;font-weight:600;">Recent Encounters</h3>
                <div class="match-list">
                    ${allMatches.slice(0,5).map(match => {
                        const homeTeam = teams.find(t => t.team.id === match.homeTeamId)?.team;
                        const awayTeam = teams.find(t => t.team.id === match.awayTeamId)?.team;
                        return `
                            <div class="match-item">
                                <div class="match-header">
                                    <div class="opponent-info">
                                        <img src="${homeTeam?.logo || ''}" class="opponent-logo">
                                        <span>${homeTeam?.displayName || 'Home'} vs ${awayTeam?.displayName || 'Away'}</span>
                                    </div>
                                    <div class="match-result">
                                        <div class="score">${match.score}</div>
                                        <div class="match-date">${formatDate(match.gameDate)}</div>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        } else {
            matchesContainer.innerHTML = '<div class="no-data">No head-to-head data available</div>';
        }
    }

    function renderTeamStatistics(teams) {
        const containerEl = container.querySelector('.fw-team-statistics');
        containerEl.innerHTML = '';
        teams.forEach(team => {
            const teamDiv = document.createElement('div');
            teamDiv.innerHTML = `
                <div class="team-info">
                    <img src="${team.team.logo}" class="team-logo">
                    <div class="team-name" style="color:#${team.team.color}">${team.team.displayName}</div>
                </div>
                <div>
                    ${team.statistics.map(stat => `
                        <div class="stat-item">
                            <span class="stat-label">${stat.label}</span>
                            <span class="stat-value" style="color:#${team.team.color}">${stat.displayValue}</span>
                        </div>
                    `).join('')}
                </div>
            `;
            containerEl.appendChild(teamDiv);
        });
    }

    function renderVenueInfo(venue, homeTeam) {
        const containerEl = container.querySelector('.fw-venue-info');
        containerEl.innerHTML = `
            <div style="margin-bottom:24px;">
                <h3 style="font-size:24px;font-weight:700;margin-bottom:8px;">${venue.fullName}</h3>
                <p style="color:#64748b;">${venue.shortName}</p>
            </div>
            <div class="venue-grid">
                <div class="venue-item"><span>📍</span><div><div>Location</div><div>${venue.address.city}, ${venue.address.country}</div></div></div>
                <div class="venue-item"><span>👥</span><div><div>Capacity</div><div>66,000</div></div></div>
                ${homeTeam ? `<div class="venue-item"><span>🏠</span><div><div>Home Team</div><div>${homeTeam.team.displayName}</div></div></div>`:''}
                <div class="venue-item"><span>📅</span><div><div>Opened</div><div>2016</div></div></div>
            </div>
        `;
    }

    // === Render Wrapper ===
    function renderData(data) {
        container.querySelector('.fw-loading').style.display = 'none';
        container.querySelector('.fw-content').style.display = 'block';

        if (data.boxscore?.form) renderRecentForm(data.boxscore.form);
        if (data.boxscore?.teams) {
            renderHeadToHead(data.headToHeadGames || [], data.boxscore.teams);
            renderTeamStatistics(data.boxscore.teams);
            const homeTeam = data.boxscore.teams.find(t => t.homeAway === 'home');
            if (data.gameInfo?.venue) renderVenueInfo(data.gameInfo.venue, homeTeam);
        }

        try {
            (adsbygoogle = window.adsbygoogle || []).push({});
            (adsbygoogle = window.adsbygoogle || []).push({});
            (adsbygoogle = window.adsbygoogle || []).push({});
        } catch(e) { console.log("AdSense not loaded"); }
    }

    // === Main fetch with cache ===
    async function loadFixtureData() {
        let data = null;

        try {
            const res = await fetch(API_URL);
            if (res.ok) {
                data = await res.json();
                localStorage.setItem(CACHE_KEY, JSON.stringify({
                    data,
                    timestamp: Date.now()
                }));
            }
        } catch (e) {
            console.log("API failed, will try cache", e);
        }

        if (!data) {
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                const { data: cachedData, timestamp } = JSON.parse(cached);
                if (Date.now() - timestamp < CACHE_EXPIRY) {
                    console.log("Loaded data from cache ✅");
                    data = cachedData;
                }
            }
        }

        if (data) {
            renderData(data);
        } else {
            container.querySelector('.fw-loading').style.display = 'none';
        }
    }

    loadFixtureData();
}

// Init all widgets
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.football-widget').forEach(createWidget);
});
