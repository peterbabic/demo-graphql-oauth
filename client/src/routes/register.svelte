<script>
    import { request } from "graphql-request"

    const uri = "http://localhost:4000/graphql"
    const createUserMutation = `
    mutation ($email: String!, $password: String!) {
        createUser(email: $email, password: $password) {
            email
            id
        }
    }`

    const handleSubmit = () => {
        response = getResponse()
    }

    const getResponse = async () => {
        if (email && password) {
            const res = await request(uri, createUserMutation, { email, password })
            return res.createUser
        }
    }
    // function handleSubmit() {
    //     console.log("HANDLE")
    // }

    let email
    let password
    let response
</script>

<svelte:head>
    <title>User Registration</title>
</svelte:head>

<h1>User Registration</h1>

<form on:submit|preventDefault="{handleSubmit}">
    <label>Login</label>
    <input bind:value="{email}" type="text" />{email}
    <br />

    <label>Password</label>
    <input bind:value="{password}" type="text" />{password}

    <br />
    <button type="submit">Submit</button>
</form>

{#await response}
<p>...waiting</p>
{:then user}
<p>The user ID is {{...user}.id}</p>
<p id="output">The user email is {{...user}.email}</p>
{:catch error}
<p style="color: red">{error.message}</p>
{/await}
