import { useState, useEffect } from "react";
import "./App.css"

function App() {
  //States
  const [metric, setMetric] = useState("plays")
  const [year, setYear] = useState(2025);
  const [artists, setArtists] = useState({});
  const [songs, setSongs] = useState({})
  const [yearlySummary, setYearlySummary] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [monthlySummary, setMonthlySummary] = useState(null)

  //Others
  const displayYear = year === -1 ? "All time" : year;
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/top-artists/${year}?metric=${metric}`)
    .then(res => res.json())
    .then(setArtists);

    fetch(`http://127.0.0.1:8000/top-songs/${year}?metric=${metric}`)
    .then(res => res.json())
    .then(setSongs)

    fetch(`http://127.0.0.1:8000/yearly_summary/${year}`)
      .then(res => res.json())
      .then(setYearlySummary);

    fetch(`http://127.0.0.1:8000/monthly_summary/${year}`)
    .then(res => res.json())
    .then(setMonthlySummary);

  }, [year, metric]);

  return (
    <div className="container">
      <h1 className="title">Your Music Dashboard</h1>

      <div className="controls">
        <div className="control-group">
          <label>Year</label>
          <select value={year} onChange={e => setYear(Number(e.target.value))}>
            <option value={-1}>All time</option>
            <option value={2018}>2018</option>
            <option value={2019}>2019</option>
            <option value={2020}>2020</option>
            <option value={2021}>2021</option>
            <option value={2022}>2022</option>
            <option value={2023}>2023</option>
            <option value={2024}>2024</option>
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
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

      <div className="grid">
        <div className="card">
          <h2>Top Artists</h2>
          <ul className="list">
            {Object.entries(artists).map(([artist, metrics]) => (
              <li key={artist}>
                <span>{artist}</span>
                <span>
                  {metrics} {metric === "duration" ? "min" : "plays"}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h2>Top Songs</h2>
          <ul className="list">
            {Object.entries(songs).map(([song, metrics]) => (
              <li key={song}>
                <span>{song}</span>
                <span>
                  {metrics} {metric === "duration" ? "min" : "plays"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {year !== -1 &&(
        <div className="monthly-info">
          <div className="month-btns" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            {months.map((month, index) => (
              <button
                key={month}
                className={`month-btn ${selectedMonth === index + 1 ? "active" : ""}`}
                onClick={() => setSelectedMonth(index + 1)}
                style={{ margin: '0 4px', padding: '6px 12px', cursor: 'pointer' }}
              >
                {month}
              </button>
            ))}
          </div>

          {selectedMonth && monthlySummary && monthlySummary[selectedMonth] && (
            <div className="card monthly-summary" style={{ textAlign: 'center', padding: '1rem' }}>
              <h3>{months[selectedMonth - 1]} Summary</h3>
              <div className="summary-grid" style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1rem' }}>
                <div>
                  <p className="label">Total Hours</p>
                  <p className="value">{monthlySummary[selectedMonth].total_hours ?? 0}</p>
                </div>
                <div>
                  <p className="label">Unique Artists</p>
                  <p className="value">{monthlySummary[selectedMonth].unique_artists ?? 0}</p>
                </div>
                <div>
                  <p className="label">Unique Songs</p>
                  <p className="value">{monthlySummary[selectedMonth].unique_songs ?? 0}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
    </div>
  );

}

export default App;