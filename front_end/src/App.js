import { useState, useEffect, useRef } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";
import "./App.css";

function App() {
  // States
  const [metric, setMetric] = useState("plays");
  const [year, setYear] = useState(-1);
  const [artists, setArtists] = useState({});
  const [songs, setSongs] = useState({});
  const [yearlySummary, setYearlySummary] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [monthlySummary, setMonthlySummary] = useState({});
  const [artistsMonthly, setArtistsMonthly] = useState({});
  const [songsMonthly, setSongsMonthly] = useState({});
  const [timelineData, setTimelineData] = useState({})
  const [newArtists, setNewArtists] = useState({})
  // Constants
  const displayYear = year === -1 ? "All time" : year;
  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  const monthlyTimeline = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const topSong = Object.entries(songsMonthly[month] || {})[0]?.[0] || "N/A";
    const topArtist = Object.entries(artistsMonthly[month] || {})[0]?.[0] || "N/A";

    return {
      month,
      monthName: months[i].slice(0,3),
      topSong,
      topArtist,
    };
  });
  //References
  const monthlyRef = useRef(null);
  const yearRef = useRef(null)

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

    fetch(`http://127.0.0.1:8000/duration_timeline/${year}`)
      .then(res => res.json())
      .then(setTimelineData);

    fetch(`http://127.0.0.1:8000/top_new_artists/${year}?metric=${metric}`)
      .then(res => res.json())
      .then(setNewArtists);
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
        
        {year !== -1 && (
          <div className="navigation-btns">
            <button className="goto-yearly-btn" onClick={() => yearRef.current?.scrollIntoView({behavior: "smooth"})}>
                Yearly review
            </button>
            <button className="goto-monthly-btn" onClick={() => monthlyRef.current?.scrollIntoView({behavior: "smooth"})}>
                Monthly review
            </button>
          </div>

        )}
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="yearly-info">
          {/* Yearly Summary */}
          {yearlySummary && (
            <div className="card yearlySummary" ref={yearRef}>
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

          {/* Top Artists, Songs & New Favourites */}
          <div className="top-grid">
            <div className="card">
              <h2>Top Artists of {displayYear}</h2>
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
              <h2>Top Songs of {displayYear}</h2>
              <ul className="list">
                {Object.entries(songs || {}).map(([song, metrics]) => (
                  <li key={song}>
                    <span>{song}</span>
                    <span>{metrics} {metric === "duration" ? "min" : "plays"}</span>
                  </li>
                ))}
              </ul>
            </div>

            {year !== -1 && (
              <div className="card new-artists">
                <div className="new-artists-header">
                  <h2>New Favourites</h2>
                  <span className="new-artists-year">{year}</span>
                </div>
                <p className="new-artists-subtitle">Artists you discovered this year</p>
                <div className="new-artists-grid">
                  {Object.entries(newArtists).map(([artist, plays], i) => (
                    <div key={artist} className="new-artist-card">
                      <span className="new-artist-rank">#{i + 1}</span>
                      <span className="new-artist-name">{artist}</span>
                      <span className="new-artist-plays">{plays} {metric === "duration" ? "min" : "plays"}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          

          <div className="card duration-timeline">
            {timelineData.length > 0 && (
              <>
                <h2>Listening Duration Over Time</h2>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={timelineData} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      axisLine={{ stroke: "#e2e8f0" }}
                      tickLine={false}
                      label={{ value: year === -1 ? "Year" : "Month", position: "insideBottom", offset: -15, fill: "#64748b", fontSize: 13 }}
                    />
                    <YAxis
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `${v}m`}
                      label={{ value: "Minutes", angle: -90, position: "insideLeft", offset: -5, fill: "#64748b", fontSize: 13 }}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                      labelStyle={{ color: "#1e293b", fontWeight: "bold", marginBottom: "4px" }}
                      itemStyle={{ color: "#4f46e5" }}
                      formatter={(value) => [`${value.toLocaleString()} min`, "Duration"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="minutes"
                      stroke="#4f46e5"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: "#4f46e5", strokeWidth: 0 }}
                      activeDot={{ r: 7, fill: "#fff", stroke: "#4f46e5", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </>
            )}
          </div>

        </div>
        {/* Monthly Section */}
        {year !== -1 && (
          <div className="monthly-info">

            <div className="timeline-wrapper">
              <div className="timeline-container">
                {monthlyTimeline.map(item => (
                  <div key={item.month} className="timeline-card">
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <h4>{item.monthName}</h4>
                      <p><strong>Top Artist:</strong> {item.topArtist}</p>
                      <p><strong>Top Song:</strong> {item.topSong}</p>
                      <div className="timeline-bar" style={{ width: `${item.hours * 10 || 50}px` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Month Buttons */}
            <div className="month-btns" ref={monthlyRef}>
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
              <div className="top-grid">
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