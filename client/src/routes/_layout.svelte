<script>
    import Nav from "./_components/Nav.svelte"
    import { beforeExpiry, fetchToken, token, user } from "./_components/common"
    import { onMount } from "svelte"

    export let segment

    let interval = setInterval(() => {})
    let refreshCount = 0

    user.subscribe(user => user)

    token.subscribe(newToken => {
        if (newToken !== undefined && newToken !== null) {
            clearInterval(interval)
            interval = setInterval(async () => {
                token.set(await fetchToken())
                refreshCount++
            }, beforeExpiry(newToken))
        }
    })

    onMount(async () => {
        token.set(await fetchToken())
    })
</script>

<Nav {segment} />
<main cy={refreshCount}>
    <slot />
</main>

<style>
    main {
        position: relative;
        max-width: 56em;
        background-color: white;
        padding: 2em;
        margin: 0 auto;
        box-sizing: border-box;
    }
</style>
