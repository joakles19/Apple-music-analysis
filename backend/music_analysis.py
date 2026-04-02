import pandas as pd

class analyse_music_history:
    def __init__(self, filepath):
        # Load CSV and parse dates
        self.history_df = pd.read_csv(filepath)
        self.history_df['Date Played'] = pd.to_datetime(self.history_df['Date Played'], format='%Y%m%d')

        # Clean dataframe (split artist and song and remove skips)
        self.df = self.__clean_song_formats(self.history_df)
        self.df_clean = self.__remove_skips(self.df)

    #Private helpers
    def __clean_song_formats(self, df) -> pd.DataFrame:
        df[['Artist', 'Song']] = df['Track Description'].str.split(' - ', n=1, expand=True)
        df = df.dropna(subset=['Song', 'Artist'])
        return df
    
    def __remove_skips(self, df) -> pd.DataFrame:
        df = df[(df['Play Duration Milliseconds'] != 0) & (df['End Reason Type'] != 'TRACK_SKIPPED_FORWARDS')]
        return df

    def __filter_by_date(self, start_date=None, end_date=None) -> pd.DataFrame:
        df = self.df_clean
        if start_date:
            df = df[df['Date Played'] >= pd.to_datetime(start_date)]
        if end_date:
            df = df[df['Date Played'] <= pd.to_datetime(end_date)]
        return df

    def __top_songs(self, start_date=None, end_date=None) -> pd.Series:
        df = self.__filter_by_date(start_date, end_date)
        return df['Track Description'].value_counts()

    def __top_artists(self, start_date=None, end_date=None) -> pd.Series:
        df = self.__filter_by_date(start_date, end_date)
        return df['Artist'].value_counts()

    #Plays methods
    def most_played_songs_plays(self, number=None, start_date=None, end_date=None) -> pd.Series:
        return self.__top_songs(start_date, end_date).head(number)

    def most_played_artists_plays(self, number=None, start_date=None, end_date=None) -> pd.Series:
        return self.__top_artists(start_date, end_date).head(number)

    #Duration methods
    def most_played_songs_duration(self, number=None, start_date=None, end_date=None) -> pd.Series:
        df = self.__filter_by_date(start_date, end_date)
        song_duration = df.groupby(['Artist','Song'])['Play Duration Milliseconds'].sum()
        song_duration = song_duration / (1000 * 60)  # convert to minutes
        song_duration = song_duration.round(2)
        return song_duration.sort_values(ascending=False).head(number)

    def most_played_artists_duration(self, number=None, start_date=None, end_date=None) -> pd.Series:
        df = self.__filter_by_date(start_date, end_date)
        artist_duration = df.groupby('Artist')['Play Duration Milliseconds'].sum()
        artist_duration = artist_duration / (1000 * 60)  # convert to minutes
        artist_duration = artist_duration.round(2)
        return artist_duration.sort_values(ascending=False).head(number)

    def top_per_year(self, category, listening_type, year=None, n=None):
        """
        Return top items for a year or all-time in a JSON-friendly format:
        - Artists: {artist: value}
        - Songs: {artist - song: value}
        Works for both 'plays' and 'duration'.
        
        If `year` is None, returns all-time stats.
        """
        category = category.lower()
        listening_type = listening_type.lower()

        if year is not None:
            start_date = f"{year}/01/01"
            end_date = f"{year}/12/31"
        else:
            start_date = None
            end_date = None

        if category in ['artists', 'artist']:
            if listening_type == 'plays':
                series = self.most_played_artists_plays(n, start_date, end_date)
            elif listening_type == 'duration':
                series = self.most_played_artists_duration(n, start_date, end_date)
            else:
                raise ValueError("Invalid listening_type: must be 'plays' or 'duration'")
            result = {str(k): v for k, v in series.items()}

        elif category in ['songs', 'song']:
            if listening_type == 'plays':
                series = self.most_played_songs_plays(n, start_date, end_date)
            elif listening_type == 'duration':
                series = self.most_played_songs_duration(n, start_date, end_date)
            else:
                raise ValueError("Invalid listening_type: must be 'plays' or 'duration'")
            result = {}
            for key, value in series.items():
                if isinstance(key, tuple):
                    result[f"{key[0]} - {key[1]}"] = value
                else:
                    result[str(key)] = value

        else:
            raise ValueError("Invalid category: must be 'artists' or 'songs'")

        return result
    
    def top_per_month(self, category, listening_type, year, n=10):
        """
        Returns top items per month for a given year.
        - category: 'artists' or 'songs'
        - listening_type: 'plays' or 'duration'
        - year: the year to analyze
        - n: number of top items per month to return (default 1)
        
        Returns a dict of the form:
        {
            'YYYY-MM': { 'item_name': value, ... },
            ...
        }
        """
        category = category.lower()
        listening_type = listening_type.lower()

        start_date = f"{year}/01/01"
        end_date = f"{year}/12/31"

        df = self.__filter_by_date(start_date, end_date).copy()
        df['YearMonth'] = df['Date Played'].dt.month

        result = {}

        for month, month_df in df.groupby('YearMonth'):
            if category in ['artists', 'artist']:
                if listening_type == 'plays':
                    counts = month_df['Artist'].value_counts().head(n)
                elif listening_type == 'duration':
                    counts = month_df.groupby('Artist')['Play Duration Milliseconds'].sum()
                    counts = (counts / (1000*60)).round(2)
                    counts = counts.sort_values(ascending=False).head(n)
                else:
                    raise ValueError("Invalid listening_type: must be 'plays' or 'duration'")
                month_result = {str(k): v for k, v in counts.items()}

            elif category in ['songs', 'song']:
                if listening_type == 'plays':
                    counts = month_df['Track Description'].value_counts().head(n)
                elif listening_type == 'duration':
                    counts = month_df.groupby(['Artist','Song'])['Play Duration Milliseconds'].sum()
                    counts = (counts / (1000*60)).round(2)
                    counts = counts.sort_values(ascending=False).head(n)
                else:
                    raise ValueError("Invalid listening_type: must be 'plays' or 'duration'")

                month_result = {}
                for key, value in counts.items():
                    if isinstance(key, tuple):
                        month_result[f"{key[0]} - {key[1]}"] = value
                    else:
                        month_result[str(key)] = value
            else:
                raise ValueError("Invalid category: must be 'artists' or 'songs'")

            result[month] = month_result

        return result


    #Summary
    def yearly_summary_report(self, start_date=None, end_date=None):
        df = self.__filter_by_date(start_date, end_date)
        total_hours = df['Play Duration Milliseconds'].sum() / (1000 * 60 * 60)
        return {
            "total_hours": round(total_hours, 2),
            "unique_artists": int(df['Artist'].nunique()),
            "unique_songs": int(df['Song'].nunique())
        }

    def monthly_summary_report(self, year=None):
        """
        Returns monthly summary: total hours, unique artists, unique songs per month.
        If year is None, considers all-time data.
        """
        if year:
            start_date = f"{year}/01/01"
            end_date = f"{year}/12/31"
        else:
            start_date = None
            end_date = None

        df = self.__filter_by_date(start_date, end_date).copy()
        if df.empty:
            return {}  # avoid errors if no data

        # Extract month number for easier frontend use
        df['Month'] = df['Date Played'].dt.month

        monthly = df.groupby('Month').agg(
            total_hours=('Play Duration Milliseconds', lambda x: round(x.sum()/(1000*60*60), 2)),
            unique_artists=('Artist', 'nunique'),
            unique_songs=('Song', 'nunique')
        )

        return monthly.to_dict(orient='index')
    
if __name__ == "__main__":
    music = analyse_music_history('backend\Data\Apple Music - Play History Daily Tracks.csv')
