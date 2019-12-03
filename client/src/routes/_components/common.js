import { GraphQLClient, request } from "graphql-request"
import { derived, writable } from "svelte/store"
import {
    accessTokenMutation,
    createUserMutation,
    meMutation,
    signOutMutation,
} from "./queries"

export const gqlUri = "http://localhost:4000/graphql"
export const rtUri = `http://localhost:4000/refresh_token`
export const fetchParams = {
    method: "POST",
    credentials: "include",
}
export const gqlParams = {
    mode: "cors",
    credentials: "include",
}

export const token = writable(undefined)
export const user = derived(
    token,
    ($token, set) => {
        if ($token != null) {
            meMutationRequest($token).then(response => {
                if (response != null) {
                    set(response)
                }
            })
        }
    },
    { id: undefined, email: undefined }
)

export const accesTokenMutationRequest = async (email, password) => {
    let client = new GraphQLClient(gqlUri, gqlParams)

    const response = await client.request(accessTokenMutation, {
        email,
        password,
    })

    if (response.accessToken !== undefined) {
        return response.accessToken
    }

    return null
}

export const signOutMutationRequest = async () => {
    let client = new GraphQLClient(gqlUri, gqlParams)
    const response = await client.request(signOutMutation)

    if (response.me !== undefined) {
        return response.me
    }

    return null
}

export const meMutationRequest = async token => {
    const client = new GraphQLClient(gqlUri, {
        headers: {
            Authorization: "Bearer " + token,
        },
    })

    const response = await client.request(meMutation)

    if (response.me !== undefined) {
        return response.me
    }

    return null
}

export const createUserMutationRequest = async (email, password) => {
    const response = await request(gqlUri, createUserMutation, {
        email,
        password,
    })

    if (response.createUser !== undefined) {
        return response.createUser
    }

    return null
}

export const fetchToken = async () => {
    let response = await fetch(rtUri, fetchParams)
    response = await response.json()

    return response.data
}

export const beforeExpiry = token => {
    const tokenPayload = parseJwt(token)
    const tokenExpiry = parseInt(tokenPayload.exp) - parseInt(tokenPayload.iat)
    return tokenExpiry * 0.8 * 1000 + 1000
}

const parseJwt = token => {
    var base64Url = token.split(".")[1]
    var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    var jsonPayload = decodeURIComponent(
        atob(base64)
            .split("")
            .map(function(c) {
                return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
            })
            .join("")
    )

    return JSON.parse(jsonPayload)
}
