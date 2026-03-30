import pandas as pd

class analyse_music_history:
    def __init__(self, filepath):
        #Unchanged df
        self.history_df = pd.read_csv(filepath)
        self.history_df['Date Played'] = pd.to_datetime(self.history_df['Date Played'], format='%Y%m%d')

        #Cleaned df
        self.df_clean = self.__clean_song_formats(self.history_df)
    
    def __top_songs(self, start_date=None, end_date=None) -> pd.Series:
        df = self.__filter_by_date(start_date, end_date)

        #Value counts
        song_counts = df['Track Description'].value_counts()

        return song_counts


    def __top_artists(self, start_date=None, end_date=None) -> pd.Series:
        df = self.__filter_by_date(start_date, end_date)

        #Value counts
        artist_counts = df['Artist'].value_counts()

        return artist_counts
    

    def __clean_song_formats(self, df) -> pd.Series:
        #Split artist and song
        df[['Artist', 'Song']] = df['Track Description'].str.split(' - ', n=1, expand=True)

        #Remove invalid descriptions
        df = df.dropna(subset=['Song', 'Artist'])

        return df
    
    def __filter_by_date(self, start_date=None, end_date=None):
        df = self.df_clean
        if start_date:
            df = df[df['Date Played'] >= pd.to_datetime(start_date)]
        if end_date:
            df = df[df['Date Played'] <= pd.to_datetime(end_date)]

        return df
    
    def most_played_songs_plays(self, number, start_date=None, end_date=None) -> pd.Series:
        """Return top n songs based on amount of plays"""

        songs = self.__top_songs(start_date, end_date).head(number)
        print(f"Top {number} songs by number of plays:")
        for index, (song, count) in enumerate(songs.items(), start=1):
            print(f"{index}. {song} — {count} plays")

        return songs
    
    def most_played_artists_plays(self, number, start_date=None, end_date=None) -> pd.Series:
        """Return top n artists based on amount of plays"""

        artists = self.__top_artists(start_date, end_date).head(number)
        print(f"Top {number} artists by amount of plays:")
        for index, (artist, count) in enumerate(artists.items(), start=1):
            print(f"{index}. {artist} — {count} plays")

        return artists
    
    def most_played_songs_duration(self, number, start_date=None, end_date=None) -> pd.Series:
        """Return top n songs based on total listening time (min)"""
        df = self.__filter_by_date(start_date, end_date)

        song_duration = df.groupby(['Artist','Song'])['Play Duration Milliseconds'].sum()
        song_duration = song_duration / (1000 * 60)
        top_songs = song_duration.sort_values(ascending=False).head(number)

        print(f"Top {number} songs by total listening time:")
        for index, ((artist, song), duration) in enumerate(top_songs.items(), start=1):
            print(f"{index}. {artist} - {song} - {duration:.0f} min")

        return top_songs

    def most_played_artists_duration(self, number, start_date=None, end_date=None) -> pd.Series:
        """Return top n artists based on total listening time (min)"""

        df = self.__filter_by_date(start_date, end_date)

        artist_duration = df.groupby('Artist')['Play Duration Milliseconds'].sum()
        artist_duration = artist_duration / (1000 * 60)
        top_artists = artist_duration.sort_values(ascending=False).head(number)

        print(f"Top {number} artists by total listening time:")
        for index, (artist, duration) in enumerate(top_artists.items(), start=1):
            print(f"{index}. {artist} - {duration:.0f} min")

        return top_artists
    
    def summary_report(self, start_date=None, end_date=None):
        """Overall summary of listening history within optional date range"""
        df = self.__filter_by_date(start_date, end_date)
        total_listening_hours = df['Play Duration Milliseconds'].sum() / (1000*60*60)
        unique_artists = df['Artist'].nunique()
        unique_songs = df['Song'].nunique()
        print(f"Total listening time: {total_listening_hours:.2f} hours")
        print(f"Unique artists: {unique_artists}")
        print(f"Unique songs: {unique_songs}")

if __name__ == '__main__':
    jack_music = analyse_music_history("Data\Apple Music - Play History Daily Tracks.csv")

    jack_music.most_played_songs_plays(10, '2026-01-01', '2027-12-31')
