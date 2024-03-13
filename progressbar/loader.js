const loader = {
    onAdd: function () {
        const progressbar = L.DomUtil.create('progress', 'loader');
        return progressbar
    },
    loadWithCurrentTotal: (current, total) => {
        const progressbar = document.getElementsByClassName('loader')[0]
        progressbar.min = 0
        progressbar.max = total
        progressbar.value = current
        progressbar.style.display = "block"
    },
    load: () => {
        const progressbar = document.getElementsByClassName('loader')[0]
        progressbar.style.display = "block"
    },
    stop: () => {
        document.getElementsByClassName('loader')[0].style.display = "none"
    }
}

export { loader }