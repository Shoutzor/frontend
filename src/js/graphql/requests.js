import gql from 'graphql-tag';

export const LASTPLAYED_QUERY = gql`
    query last_played {
        requests(
            where: { column: PLAYED_AT, operator: IS_NOT_NULL},
            orderBy: { column: "played_at", order: DESC },
            first: 1
        ) {
            data {
                id
                requested_by {
                    id
                    username
                }
                media {
                    id
                    title
                    image
                    duration
                    artists {
                        id
                        name
                    }
                }
            }
        }
    }`;

export const COMINGUP_QUERY = gql`
    query comingup_query($page: Int, $limit: Int) {
        requests(
            page: $page,
            first: $limit,
            where: { column: PLAYED_AT, operator: IS_NULL }
        ) {
            paginatorInfo{
                total
                lastPage
            }
            data {
                id
                media {
                    id
                    title
                    is_video
                    duration
                    artists {
                        id,
                        name
                    }
                }
                requested_at
                requested_by {
                    id
                    username
                }
            }
        }
    }`;

export const HISTORY_QUERY = gql`
    query history_query($page: Int, $limit: Int) {
        requests(
            page: $page,
            first: $limit,
            where: { column: PLAYED_AT, operator: IS_NOT_NULL }
            orderBy: { column: "played_at", order: DESC }
        ) {
            paginatorInfo{
                total
                lastPage
            }
            data {
                id
                media {
                    id
                    title
                    is_video
                    duration
                    album {
                        id
                        title
                    }
                    artists {
                        id,
                        name
                    }
                }
                played_at
                requested_by {
                    id
                    username
                }
            }
        }
    }`;

export const ADDREQUEST_MUTATION = gql`
    mutation addrequest_mutation($id: ID!) {
        addRequest(id: $id) {
            success
            message
        }
    }`;

export const REQUESTADDED_SUBSCRIPTION = gql`
    subscription requestadded_subscription {
        requestAdded {
            id
        }
    }`;
