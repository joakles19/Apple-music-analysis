from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from music_analysis import analyse_music_history
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

music_data = analyse_music_history("backend\Data\Apple Music - Play History Daily Tracks.csv")

@app.get("/top-artists/{year}")
def top_artists(year:int, n:int=10, metric:str="plays"):
    if year == 'All time':
        year = None
    data = music_data.top_per_year('artist', metric, year, n)
    return data

@app.get("/top-songs/{year}")
def top_songs(year:int, n:int=10, metric:str="plays"):
    if year == 'All time':
        year = None
    data = music_data.top_per_year('songs', metric, year, n)
    return data

@app.get("/yearly_summary/{year}")
def yearly_summary(year:int):
    if year == 'All time':
        year = None
    start_date = f"{year}/01/01"
    end_date = f"{year}/12/31"
    data = music_data.yearly_summary_report(start_date, end_date)
    return data

@app.get("/monthly_summary/{year}")
def monthly_summary(year: int):
    if year == -1:
        year = None
    data = music_data.monthly_summary_report(year)
    return data

@app.get("/monthly_artists/{year}")
def top_artists_month(year:int, metric:str="plays"):
    data = music_data.top_per_month('artists', metric, year)
    return data

@app.get("/monthly_songs/{year}")
def top_songs_month(year:int, metric:str="plays"):
    data = music_data.top_per_month('songs', metric, year)
    return data

@app.get("/duration_timeline/{year}")
def duration_timeline(year:int):
    if year == -1:
        year = None
    timeline = music_data.listening_duration_timeline(year)
    return timeline

@app.get("/top_new_artists/{year}")
def top_new_artists(year:int, metric:str="plays"):
    data = music_data.get_top_new_artists(year, metric)
    return data

@app.get("/search/{query}")
def search(query: str, metric: str = "plays"):
    query_lower = query.lower()
    df = music_data.df_clean
    artist_match = df[df['Artist'].str.lower() == query_lower]

    if not artist_match.empty:
        match_df = artist_match
    else:
        return {"error": "No results found"}
    
    if metric == "plays":
        ranks = music_data.most_played_artists_plays()
    else:
        ranks = music_data.most_played_artists_duration()

    ranks.index = ranks.index.str.lower()
    rank = int(ranks.index.get_loc(query_lower)) + 1 if query_lower in ranks.index else None

    match_df = match_df.copy()
    match_df['Year'] = match_df['Date Played'].dt.year

    yearly = {}
    for year, group in match_df.groupby('Year'):
        if metric == "duration":
            value = round(group['Play Duration Milliseconds'].sum() / (1000 * 60), 2)
        else:
            value = int(len(group))
        yearly[int(year)] = value

    return {
        "name": query,
        "rank": rank,
        "total_plays": int(len(match_df)),
        "total_minutes": round(match_df['Play Duration Milliseconds'].sum() / (1000 * 60), 2),
        "first_listened": str(match_df['Date Played'].min().date()),
        "yearly_breakdown": yearly
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)