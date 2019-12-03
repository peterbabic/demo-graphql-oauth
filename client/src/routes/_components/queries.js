export const createUserMutation = `
    mutation ($email: String!, $password: String!) {
        createUser(email: $email, password: $password) {
            email
            id
        }
    }`

export const accessTokenMutation = `
    mutation($email: String!, $password: String!) {
        accessToken(email: $email, password: $password)
    }`

export const meMutation = `
    mutation {
        me {
            id
            email
        }
    }`

export const signOutMutation = `
    mutation {
        signOut
    }`
