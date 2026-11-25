import React, { useState, useEffect } from "react";
import RaceCard from "./Racecard";
import TopRated from "./TopRated";
import RatedRaces from "./RatedRaces";
import AppSettings from "./AppSettings";
import "./App.css";

function App() {
  const [selectedYear, setSelectedYear] = useState("2025");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [raceData, setRaceData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch races from backend and group by year
  useEffect(() => {
    fetch("http://localhost:8080/api/races")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load races");
        }
        return response.json();
      })
      .then((data) => {
        const grouped = data.reduce((acc, race) => {
          const year = String(race.season);
          const savedReview = JSON.parse(localStorage.getItem(`race-${race.id}`)) || {};
          const hydratedRace = {
            ...race,
            userRating: savedReview.userRating ?? race.userRating ?? 0,
            userReview: savedReview.userReview ?? race.userReview ?? "",
          };

          if (!acc[year]) acc[year] = [];
          acc[year].push(hydratedRace);
          return acc;
        }, {});

        const sortedYears = Object.keys(grouped).sort((a, b) => Number(b) - Number(a));
        setRaceData(grouped);
        setSelectedYear(sortedYears[0] || "2025");
        setLoading(false);
        setError("");
      })
      .catch((error) => {
        console.error("Error fetching races:", error);
        setError("The paddock feed is down. Make sure the backend is running on port 8080.");
        setLoading(false);
      });
  }, []);

  // Save race data to localStorage whenever updated
  useEffect(() => {
    if (Object.keys(raceData).length > 0) {
      localStorage.setItem("raceData", JSON.stringify(raceData));
    }
  }, [raceData]);

  // Handle submitting a review
  const handleSubmitReview = (raceId, newRating, newReview) => {
    setRaceData((prev) =>
      Object.fromEntries(
        Object.entries(prev).map(([year, races]) => [
          year,
          races.map((race) =>
            race.id === raceId
              ? { ...race, userRating: newRating, userReview: newReview }
              : race
          ),
        ])
      )
    );

    localStorage.setItem(
      `race-${raceId}`,
      JSON.stringify({ userRating: newRating, userReview: newReview })
    );
  };

  const seasons = Object.keys(raceData).sort((a, b) => Number(b) - Number(a));
  const seasonRaces = raceData[selectedYear] || [];
  const allRaces = Object.values(raceData).flat();
  const ratedRaces = allRaces.filter((race) => race.userRating > 0);
  const averageRating = ratedRaces.length
    ? (ratedRaces.reduce((total, race) => total + race.userRating, 0) / ratedRaces.length).toFixed(1)
    : "0.0";
  const latestRace = seasonRaces[seasonRaces.length - 1];

  return (
    <div className="app-shell">
      <div className="app-shell__overlay" />
      <main className="app-container">
        <header className="app-topbar">
          <a className="app-wordmark" href="#top" aria-label="RaceBoxd home">
            <span className="app-wordmark__mark">R</span>
            <span>RACEBOXD</span>
          </a>
          <button
            type="button"
            className="settings-trigger"
            onClick={() => setSettingsOpen(true)}
            aria-haspopup="dialog"
            aria-label="Open app settings"
          >
            <span className="settings-trigger__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false">
                <path d="M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Z" />
                <path d="m19.4 13.5 1.1.9-1.2 2.1-1.4-.5a7.7 7.7 0 0 1-1.6.9l-.3 1.5h-2.5l-.3-1.5a7.7 7.7 0 0 1-1.6-.9l-1.4.5L9 14.4l1.1-.9a6.5 6.5 0 0 1 0-1.9L9 10.7l1.2-2.1 1.4.5a7.7 7.7 0 0 1 1.6-.9l.3-1.5H16l.3 1.5a7.7 7.7 0 0 1 1.6.9l1.4-.5 1.2 2.1-1.1.9a6.5 6.5 0 0 1 0 1.9Z" />
              </svg>
            </span>
            <span>Settings</span>
          </button>
        </header>
        <section className="hero" id="top">
          <div className="hero__panel">
            <p className="hero__eyebrow">Formula 1 archive / fan journal</p>
            <h1 className="hero__title">RaceBoxd</h1>
            <p className="hero__lead">
              A cleaner race log for fans who remember the tyre calls, safety cars,
              late-braking moves and weekends worth rating twice.
            </p>

            <div className="hero__stats">
              <div className="stat-card">
                <span className="stat-card__label">Rated weekends</span>
                <strong className="stat-card__value">{ratedRaces.length}</strong>
              </div>
              <div className="stat-card">
                <span className="stat-card__label">Average score</span>
                <strong className="stat-card__value">{averageRating}</strong>
              </div>
              <div className="stat-card">
                <span className="stat-card__label">Seasons tracked</span>
                <strong className="stat-card__value">{seasons.length}</strong>
              </div>
            </div>
          </div>

          <aside className="hero__aside">
            <div className="hero__aside-card">
              <p className="summary-kicker">Selected season</p>
              <h2 className="summary-title">{selectedYear}</h2>
              <div className="summary-meta">
                <div>
                  <span>Race weekends</span>
                  <strong>{seasonRaces.length || "0"}</strong>
                </div>
                <div>
                  <span>Reviewed</span>
                  <strong>{seasonRaces.filter((race) => race.userRating > 0).length}</strong>
                </div>
              </div>
              <p className="hero__aside-note">
                {latestRace
                  ? `Latest on the board: ${latestRace.name}`
                  : "No calendar loaded for this season yet."}
              </p>
            </div>
          </aside>
        </section>

        <section className="dashboard-grid">
          <TopRated raceData={raceData} />
          <RatedRaces raceData={raceData} />
        </section>

        <section className="season-toolbar">
          <div>
            <p className="summary-kicker">Season view</p>
            <h2 className="season-toolbar__title">{selectedYear} race weekends</h2>
          </div>

          <label className="season-select" htmlFor="year-select">
            <span>Season</span>
            <select
              id="year-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {seasons.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>
        </section>

        {loading ? (
          <div className="status-card">
            <p className="summary-kicker">Loading</p>
            <h3>Pulling race data from the pit wall.</h3>
          </div>
        ) : error ? (
          <div className="status-card status-card--error">
            <p className="summary-kicker">Connection issue</p>
            <h3>{error}</h3>
          </div>
        ) : seasonRaces.length > 0 ? (
          <section className="race-grid">
            {seasonRaces.map((race) => (
              <RaceCard
                key={race.id}
                race={race}
                onSubmitReview={handleSubmitReview}
              />
            ))}
          </section>
        ) : (
          <div className="status-card">
            <p className="summary-kicker">Empty season</p>
            <h3>No races found for {selectedYear}.</h3>
          </div>
        )}
      </main>
      {settingsOpen && <AppSettings onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}

export default App;
