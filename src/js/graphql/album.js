import gql from "graphql-tag";

export const ALBUM_QUERY = gql`
    query album_query($id: ID!) {
        album(id: $id) {
            id,
            image,
            title,
            summary
        }
    }`;

export const TOPALBUMS_QUERY = gql`
    query topalbums_query($artist: ID!, $limit: Int) {
        topAlbums(artist: $artist, limit: $limit) {
            id
            title
            image
        }
    }`;
