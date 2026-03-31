from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from music_analysis import analyse_music_history

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

music_data = analyse_music_history("Data\Apple Music - Play History Daily Tracks.csv")

@app.get("/top-artists/{year}")
def top_artists(year:int, n:int=10):
    data = music_data.top_per_year('artist', 'plays', year, n)
    return data.to_dict()

@app.get("/top-songs/{year}")
def top_songs(year:int, n:int=10):
    data = music_data.top_per_year('songs', 'plays', year, n)
    return data.to_dict()

@app.get("/summary/{year}")
def summary(year:int):
    start_date = f"{year}/01/01"
    end_date = f"{year}/12/31"
    data = music_data.summary_report(start_date, end_date)
    return data