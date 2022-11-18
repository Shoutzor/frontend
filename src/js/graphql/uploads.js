import gql from 'graphql-tag';

export const GET_UPLOADS_QUERY = gql`
    query get_uploads_query(
        $orderBy: [QueryUploadsOrderByOrderByClause!],
        $where: QueryUploadsWhereWhereConditions
    ) {
        uploads(
            orderBy: $orderBy,
            where: $where
        ) {
            paginatorInfo{
                lastPage
                total
            }
            data {
                id
                original_filename
                filename
                uploaded_at
                uploaded_by {
                    id
                }
                status
            }
        }
    }`;

export const UPLOAD_MUTATION = gql`
    mutation upload($file: FileUpload!) {
        upload(file: $file) {
            id
            original_filename
            filename
            status
        }
    }
    `;

export const UPLOAD_CREATED_SUBSCRIPTION = gql`
    subscription upload_created_subscription($id: ID) {
        uploadCreated(id: $id) {
            id
            status
        }
    }`;

export const UPLOAD_UPDATED_SUBSCRIPTION = gql`
    subscription upload_updated_subscription($id: ID) {
        uploadUpdated(id: $id) {
            id
            status
        }
    }`;

export const UPLOAD_DELETED_SUBSCRIPTION = gql`
    subscription upload_deleted_subscription($id: ID) {
        uploadDeleted(id: $id) {
            id
            status
        }
    }`;