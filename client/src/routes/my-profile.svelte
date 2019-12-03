<script context="module">
    import { token, user } from "./_components/common"
    import { get } from "svelte/store"

    export async function preload() {
        if (get(token) == null) {
            this.redirect(302, "sign-in")
        }
    }
</script>

<p cy="session">user in store from session: {$user.email}</p>
