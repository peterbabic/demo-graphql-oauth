<script>
    import * as sapper from "@sapper/app"
    import { accesTokenMutationRequest } from "./_components/common"
    import { token } from "./_components/common"
    import { onMount } from "svelte"

    token.subscribe(token => {
        if (token !== null && token !== undefined) {
            sapper.goto("/my-profile")
        }
    })

    let email
    let password

    const handleSubmit = async () => {
        const accessToken = await accesTokenMutationRequest(email, password)
        token.set(accessToken)

        await sapper.goto("/my-profile")
    }
</script>

<svelte:head>
    <title>Login</title>
</svelte:head>

<form on:submit|preventDefault={handleSubmit}>
    <label>Login</label>
    <input bind:value={email} type="text" cy="email" />
    <br />
    <label>Password</label>
    <input bind:value={password} type="text" cy="password" />
    <br />

    <button type="submit" cy="submit">Login</button>
    <span>
        Not a member?
        <a href="sign-up">sign-up</a>
    </span>
</form>
