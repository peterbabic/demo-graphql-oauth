<script context="module">
    import { signOutMutationRequest, token } from "./_components/common"

    export async function preload() {
        token.set(null)

        await signOutMutationRequest()
        await this.redirect(302, "/")
    }
</script>
