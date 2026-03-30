import basic_analysis

if __name__ == '__main__':
    jack_music = basic_analysis.analyse_music_history("Data\Apple Music - Play History Daily Tracks.csv")
    jack_music.most_played_song_overall()