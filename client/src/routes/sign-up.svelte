<script>
    import * as sapper from "@sapper/app"
    import { createUserMutationRequest } from "./_components/common"
    import { token } from "./_components/common"
    import { onMount } from "svelte"

    token.subscribe(token => {
        if (token !== null && token !== undefined) {
            sapper.goto("/my-profile")
        }
    })

    let email
    let password

    const { session } = sapper.stores()

    const handleSubmit = async () => {
        await createUserMutationRequest(email, password)
        await sapper.goto("/sign-in")
    }
</script>

<svelte:head>
    <title>User Registration</title>
</svelte:head>

<form on:submit|preventDefault={handleSubmit}>
    <label>Login</label>
    <input bind:value={email} type="text" cy="email" />
    <br />

    <label>Password</label>
    <input bind:value={password} type="text" cy="password" />
    <br />

    <button type="submit" cy="submit">Register</button>
</form>
