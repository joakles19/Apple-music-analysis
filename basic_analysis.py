import pandas as pd

class analyse_music_history:
    def __init__(self, filepath):
        #Unchanged df
        self.history_df = pd.read_csv(filepath)

        #Cleaned df
        self.df_clean = self.__clean_song_formats(self.history_df)
    
    def __top_songs(self) -> pd.Series:
        df = self.df_clean

        #Value counts
        song_counts = df['Track Description'].value_counts()

        return song_counts


    def __top_artists(self) -> pd.Series:
        df = self.df_clean

        #Value counts
        artist_counts = df['Artist'].value_counts()

        return artist_counts
    

    def __clean_song_formats(self, df) -> pd.Series:
        #Split artist and song
        df[['Artist', 'Song']] = df['Track Description'].str.split(' - ', n=1, expand=True)

        #Remove invalid descriptions
        df = df.dropna(subset=['Song', 'Artist'])

        return df
    
    def most_played_songs_plays(self, number) -> pd.Series:
        """Retun top n songs based on amount of plays"""

        songs = self.__top_songs().head(number)
        print(f"Top {number} songs by number of plays:")
        for index, (song, count) in enumerate(songs.items(), start=1):
            print(f"{index}. {song} — {count} plays")

        return songs
    
    def most_played_artists_plays(self, number) -> pd.Series:
        """Retun top n artists based on amount of plays"""

        artists = self.__top_artists().head(number)
        print(f"Top {number} artists by amount of plays:")
        for index, (artist, count) in enumerate(artists.items(), start=1):
            print(f"{index}. {artist} — {count} plays")

        return artists
    
    def most_played_songs_duration(self, number) -> pd.Series:
        """Retun top n songs based on total listening time (min)"""

        df = self.df_clean

        song_duration = df.groupby(['Artist','Song'])['Play Duration Milliseconds'].sum()
        song_duration = song_duration / (1000 * 60)
        top_songs = song_duration.sort_values(ascending=False).head(number)

        print(f"Top {number} songs by total listening time:")
        for index, ((artist, song), duration) in enumerate(top_songs.items(), start=1):
            print(f"{index}. {artist} - {song} - {duration:.0f} min")

        return top_songs

    def most_played_artists_duration(self, number) -> pd.Series:
        """Retun top n artists based on total listening time (min)"""

        df = self.df_clean

        artist_duration = df.groupby('Artist')['Play Duration Milliseconds'].sum()
        artist_duration = artist_duration / (1000 * 60)
        top_artists = artist_duration.sort_values(ascending=False).head(number)

        print(f"Top {number} artists by total listening time:")
        for index, (artist, duration) in enumerate(top_artists.items(), start=1):
            print(f"{index}. {artist} - {duration:.0f} min")

        return top_artists
    
    def summary_report(self):
        """Overall summary of listening history"""

        total_listening_hours = self.df_clean['Play Duration Milliseconds'].sum() / (1000*60*60)
        unique_artists = self.df_clean['Artist'].nunique()
        unique_songs = self.df_clean['Song'].nunique()
        print(f"Total listening time: {total_listening_hours:.2f} hours")
        print(f"Unique artists: {unique_artists}")
        print(f"Unique songs: {unique_songs}")

if __name__ == '__main__':
    jack_music = analyse_music_history("Data\Apple Music - Play History Daily Tracks.csv")

    jack_music.most_played_songs_duration(500)
