const imgGallery = document.querySelectorAll("div.imgGallery");

for (let i=0; i<imgGallery.length; i++) {
    let imgs = imgGallery[i].querySelectorAll("div.column img");
    for (let j=0; j<imgs.length; j++) {
        imgs[j].src += "?_=" + Math.random();
        imgs[j].addEventListener("click", (evt) => {
            const img = evt.target;
            if (img.tagName === "IMG") {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else {
                    img.requestFullscreen();
                }
            }
        });
    }
}
