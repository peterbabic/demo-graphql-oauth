<script>
    import { onMount } from "svelte"
    let dz

    onMount(async () => {
        const dropzone = await import("dropzone")
        dz = new dropzone.default("div#dropzone", {
            url: "http://localhost:4000/graphql",
            autoProcessQueue: true,
        })

        dz.on("sending", (file, xhr, data) => {
            data.append(
                "operations",
                `{ "query": "mutation ($file: Upload!) { uploadFigure(file: $file)}", "variables": { "file": null } }`
            )
            data.append("map", `{ "file": ["variables.file"] }`)
        })
    })
</script>

<div id="dropzone" class="dropzone" cy="dropzone" />

<style>
    .dropzone {
        height: 300px;
        background: #fdfdfd;
        border-radius: 5px;
        border: 2px dashed #ff3e00;
        display: flex;
        justify-content: center;
        align-items: center;
        transition: all 300ms ease-out;
    }
</style>
