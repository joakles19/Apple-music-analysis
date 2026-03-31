import { useState, useEffect } from "react";

function App() {
  const [year, setYear] = useState(2025);
  const [artists, setArtists] = useState({});
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/top-artists/${year}`)
    .then(res => res.json())
    .then(setArtists);

    fetch(`http://127.0.0.1:8000/summary/${year}`)
      .then(res => res.json())
      .then(setSummary);
  }, [year])

  return (
    <div style={{ padding: "20px" }}>
      <h1>Your music dashboard</h1>

      <select value={year} onChange={e => setYear(e.target.value)}>
        <option value={2023}>2018</option>
        <option value={2023}>2019</option>
        <option value={2023}>2020</option>
        <option value={2023}>2021</option>
        <option value={2023}>2022</option>
        <option value={2023}>2023</option>
        <option value={2023}>2024</option>
        <option value={2023}>2025</option>
        <option value={2023}>2026</option>
      </select>

      {summary && (
        <div>
          <h2>Yearly summary</h2>
          <p>Total listening hours: {summary.total_hours}</p>
          <p>Unique artists: {summary.unique_artists}</p>
          <p>Unique songs: {summary.unique_songs}</p>
        </div>
      )}

      <h2>Top artists</h2>
      <ul>
        {Object.entries(artists).map(([artist, plays]) => (
          <li key={artist}>
            {artist}: {plays}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App;