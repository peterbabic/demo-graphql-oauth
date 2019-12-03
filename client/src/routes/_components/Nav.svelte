<script>
    import { token } from "./common"
    import { fade } from "svelte/transition"

    export let segment
</script>

<nav>
    <ul>
        <li>
            <a class="white" href="/">.</a>
        </li>

        {#if $token !== undefined}
            <li transition:fade>
                <a class:selected={segment === undefined} href="/">home</a>
            </li>
        {/if}

        {#if $token === null}
            <li transition:fade>
                <a class:selected={segment === 'sign-up'} href="sign-up">
                    sign-up
                </a>
            </li>
            <li transition:fade>
                <a class:selected={segment === 'sign-in'} href="sign-in">
                    sign-in
                </a>
            </li>
        {/if}

        {#if $token}
            <li transition:fade>
                <a class:selected={segment === 'my-profile'} href="my-profile">
                    my profile
                </a>
            </li>
            <li transition:fade>
                <a class:selected={segment === 'sign-out'} href="sign-out">
                    sign-out
                </a>
            </li>
        {/if}
    </ul>
</nav>

<style>
    nav {
        border-bottom: 1px solid rgba(255, 62, 0, 0.1);
        font-weight: 300;
        padding: 0 1em;
    }

    ul {
        margin: 0;
        padding: 0;
    }

    /* clearfix */
    ul::after {
        content: "";
        display: block;
        clear: both;
    }

    li {
        display: block;
        float: left;
    }

    .selected {
        position: relative;
        display: inline-block;
    }

    .selected::after {
        position: absolute;
        content: "";
        width: calc(100% - 1em);
        height: 2px;
        background-color: rgb(255, 62, 0);
        display: block;
        bottom: -1px;
    }

    a {
        text-decoration: none;
        padding: 1em 0.5em;
        display: block;
    }

    a.white {
        color: white;
    }
</style>
