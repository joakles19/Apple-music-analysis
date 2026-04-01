import { useState, useEffect } from "react";
import "./App.css";

function App() {
  // States
  const [metric, setMetric] = useState("plays");
  const [year, setYear] = useState(-1);
  const [artists, setArtists] = useState({});
  const [songs, setSongs] = useState({});
  const [yearlySummary, setYearlySummary] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [monthlySummary, setMonthlySummary] = useState({});
  const [artistsMonthly, setArtistsMonthly] = useState({});
  const [songsMonthly, setSongsMonthly] = useState({});

  // Constants
  const displayYear = year === -1 ? "All time" : year;
  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  // Fetch data whenever year or metric changes
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/top-artists/${year}?metric=${metric}`)
      .then(res => res.json())
      .then(setArtists);

    fetch(`http://127.0.0.1:8000/top-songs/${year}?metric=${metric}`)
      .then(res => res.json())
      .then(setSongs);

    fetch(`http://127.0.0.1:8000/yearly_summary/${year}`)
      .then(res => res.json())
      .then(setYearlySummary);

    fetch(`http://127.0.0.1:8000/monthly_summary/${year}`)
      .then(res => res.json())
      .then(setMonthlySummary);

    fetch(`http://127.0.0.1:8000/monthly_artists/${year}?metric=${metric}`)
      .then(res => res.json())
      .then(setArtistsMonthly);

    fetch(`http://127.0.0.1:8000/monthly_songs/${year}?metric=${metric}`)
      .then(res => res.json())
      .then(setSongsMonthly);
  }, [year, metric]);

  return (
    <div className="container">
      
      {/* Controls fixed on left */}
      <div className="controls">
        {/* Title */}
        <h1 className="title">Your Music Dashboard</h1>
        <div className="control-group">
          <label>Year</label>
          <select value={year} onChange={e => setYear(Number(e.target.value))}>
            <option value={-1}>All time</option>
            {Array.from({ length: 9 }, (_, i) => 2018 + i).map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label>Metric</label>
          <select value={metric} onChange={e => setMetric(e.target.value)}>
            <option value="plays">Plays</option>
            <option value="duration">Duration</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">

        {/* Yearly Summary */}
        {yearlySummary && (
          <div className="card yearlySummary">
            <h2>{displayYear} Summary</h2>
            <div className="yearlySummary-grid">
              <div>
                <p className="label">Total Hours</p>
                <p className="value">{yearlySummary.total_hours}</p>
              </div>
              <div>
                <p className="label">Artists</p>
                <p className="value">{yearlySummary.unique_artists}</p>
              </div>
              <div>
                <p className="label">Songs</p>
                <p className="value">{yearlySummary.unique_songs}</p>
              </div>
            </div>
          </div>
        )}

        {/* Top Artists & Songs */}
        <div className="grid">
          <div className="card">
            <h2>Top Artists of the Year</h2>
            <ul className="list">
              {Object.entries(artists || {}).map(([artist, metrics]) => (
                <li key={artist}>
                  <span>{artist}</span>
                  <span>{metrics} {metric === "duration" ? "min" : "plays"}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card">
            <h2>Top Songs of the Year</h2>
            <ul className="list">
              {Object.entries(songs || {}).map(([song, metrics]) => (
                <li key={song}>
                  <span>{song}</span>
                  <span>{metrics} {metric === "duration" ? "min" : "plays"}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Monthly Section */}
        {year !== -1 && (
          <div className="monthly-info">
            {/* Month Buttons */}
            <div className="month-btns">
              {months.map((month, i) => (
                <button
                  key={month}
                  className={`month-btn ${selectedMonth === i + 1 ? "active" : ""}`}
                  onClick={() => setSelectedMonth(i + 1)}
                >
                  {month.slice(0,3)}
                </button>
              ))}
            </div>

            {/* Monthly Summary */}
            {selectedMonth && monthlySummary[selectedMonth] && (
              <div className="card monthly-summary">
                <h3>{months[selectedMonth - 1]} Summary</h3>
                <div className="summary-grid">
                  <div>
                    <p className="label">Total Hours</p>
                    <p className="value">{monthlySummary[selectedMonth]?.total_hours ?? 0}</p>
                  </div>
                  <div>
                    <p className="label">Unique Artists</p>
                    <p className="value">{monthlySummary[selectedMonth]?.unique_artists ?? 0}</p>
                  </div>
                  <div>
                    <p className="label">Unique Songs</p>
                    <p className="value">{monthlySummary[selectedMonth]?.unique_songs ?? 0}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Top Artists & Songs per Month */}
            {selectedMonth && (
              <div className="grid">
                <div className="card">
                  <h2>Top Artists of {months[selectedMonth - 1]}</h2>
                  <ul className="list">
                    {Object.entries(artistsMonthly[selectedMonth] || {}).map(([artist, metrics]) => (
                      <li key={artist}>
                        <span>{artist}</span>
                        <span>{metrics} {metric === "duration" ? "min" : "plays"}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="card">
                  <h2>Top Songs of {months[selectedMonth - 1]}</h2>
                  <ul className="list">
                    {Object.entries(songsMonthly[selectedMonth] || {}).map(([song, metrics]) => (
                      <li key={song}>
                        <span>{song}</span>
                        <span>{metrics} {metric === "duration" ? "min" : "plays"}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;