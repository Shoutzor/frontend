import gql from "graphql-tag";

export const ARTIST_QUERY = gql`
    query artist_query($id: ID!) {
        artist(id: $id) {
            id,
            image,
            name,
            summary
        }
    }`;

export const TOPARTISTS_QUERY = gql`
    query topartists_query($album: ID!, $limit: Int) {
        topArtists(album: $album, limit: $limit) {
            id
            name
            image
        }
    }`;
