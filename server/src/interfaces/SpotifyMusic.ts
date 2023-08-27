type SpotifyArtist = {
    name: string;
    genres: string[];
    images : {
        url: string
        height: string,
        width: string,
    }[]
};

export default SpotifyArtist;