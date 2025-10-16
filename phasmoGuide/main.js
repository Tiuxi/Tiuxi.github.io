var ghosts;
var evidences;
var evidencesLogo;
var speedLogo = ["fastWalk.svg", "normalWalk.svg", "slowWalk.svg"]
var selected = [];
var selectedSpeed = [];
var details = document.getElementById("details");

const showDetails = (ghostIndex) => {
    let ghost = ghosts[ghostIndex];

    details.querySelector(".title > h2").innerHTML = ghost.name;
    details.querySelector(".title > ul").innerHTML = "";

    ghost.evidences.forEach((ev) => {
        details.querySelector(".title > ul").insertAdjacentHTML("beforeend",
            `<li><img src="src/${evidencesLogo[ev]}"><p>${evidences[ev]}</p></li>`);
    });
    
    details.querySelector(".misc > .speed").innerHTML = `speed : <div class="value">${ghost.speed} m/s</div>`;
    details.querySelector(".misc > .huntSanity").innerHTML = `hunt sanity threshold : <div class="value">${ghost.huntSanity} %</div>`;
    if (ghost.forcedEvidence != -1)
        details.querySelector(".misc > .forcedEv").innerHTML = `Forced evidence : <div class="value">${evidences[ghost.forcedEvidence]}</div>`;
    else 
        details.querySelector(".misc > .forcedEv").innerHTML = "No forced evidence";

    details.querySelector(".traits").innerHTML = "<ul></ul>";

    ghost.traits.forEach((trait) => {
        details.querySelector(".traits > ul").insertAdjacentHTML("beforeend", 
            `<li>${trait}</li>`);
    });

    details.querySelector(".strats").innerHTML = "<ul></ul>";

    ghost.strategies.forEach((strat) => {
        details.querySelector(".strats > ul").insertAdjacentHTML("beforeend",
            `<li>${strat}</li>`);
    });

    details.style.display = "flex";
}

const animateLayoutChange = () => {
    const cards = document.querySelectorAll('#ghostsContainer article, #eliminatedGhosts article');
    const firstRects = new Map();

    cards.forEach(el => firstRects.set(el, el.getBoundingClientRect()));

    requestAnimationFrame(() => {
        cards.forEach(el => {
            const lastRect = el.getBoundingClientRect();
            const firstRect = firstRects.get(el);
            if (!firstRect) return;

            const dx = firstRect.left - lastRect.left;
            const dy = firstRect.top - lastRect.top;

            if (dx || dy) {
                el.style.transform = `translate(${dx}px, ${dy}px)`;
                el.style.transition = 'none';
                requestAnimationFrame(() => {
                    el.style.transition = 'transform 0.4s ease';
                    el.style.transform = '';
                });
            }
        });
    });
}

const moveWithAnimation = (element, newParent) => {
    const firstRect = element.getBoundingClientRect();

    newParent.appendChild(element);

    const lastRect = element.getBoundingClientRect();
    const dx = firstRect.left - lastRect.left;
    const dy = firstRect.top - lastRect.top;

    element.style.transform = `translate(${dx}px, ${dy}px)`;
    element.style.opacity = "0.6";

    requestAnimationFrame(() => {
        element.style.transition = "transform 0.4s ease, opacity 0.4s ease";
        element.style.transform = "translate(0,0)";
        element.style.opacity = "1";
    });

    element.addEventListener("transitionend", () => {
        element.style.transition = "";
        element.style.transform = "";
        element.style.opacity = "";
    }, { once: true });
}

const selectEvidence = (indexEv, src) => {
    let classes = document.getElementsByClassName(evidences[indexEv]);
    for (let i = 0; i < classes.length; i++) {
        classes[i].src = src;
    }

    const ghostsContainer = document.getElementById("ghostsContainer");
    const eliminatedContainer = document.getElementById("eliminatedGhosts");

    // Record positions before DOM changes
    animateLayoutChange();

    ghosts.forEach((ghost, indexGh) => {
        const ghostElem = document.getElementById(ghost.name);
        const eliminatedSlot = eliminatedContainer.children[indexGh];
        const activeSlot = ghostsContainer.children[indexGh];

        const shouldBeEliminated = selected.some(ev => !ghost.evidences.includes(ev));
        const shouldBeEliminated2 = selectedSpeed.some(sp => !ghost.speedType.includes(clickableSpeed[sp])) & !ghost.speedType.includes("+");

        const currentParent = ghostElem.parentElement;
        const newParent = shouldBeEliminated | shouldBeEliminated2 ? eliminatedSlot : activeSlot;

        if (currentParent !== newParent) {
            moveWithAnimation(ghostElem, newParent);
        }
    });
}

const selectSpeed = (speed) => {
    const ghostsContainer = document.getElementById("ghostsContainer");
    const eliminatedContainer = document.getElementById("eliminatedGhosts");
    animateLayoutChange();

    ghosts.forEach((ghost, indexGh) => {
        const ghostElem = document.getElementById(ghost.name);
        const eliminatedSlot = eliminatedContainer.children[indexGh];
        const activeSlot = ghostsContainer.children[indexGh];

        const shouldBeEliminated = selected.some(ev => !ghost.evidences.includes(ev));
        const shouldBeEliminated2 = selectedSpeed.some(sp => !ghost.speedType.includes(clickableSpeed[sp])) & !ghost.speedType.includes("+");

        const currentParent = ghostElem.parentElement;
        const newParent = shouldBeEliminated | shouldBeEliminated2 ? eliminatedSlot : activeSlot;

        if (currentParent !== newParent) {
            moveWithAnimation(ghostElem, newParent);
        }
    });
}


const initGhosts = async () => {
    details.style.display = "none";
    const ghostsContainer = document.getElementById("ghostsContainer");
    const response = await fetch('./src/ghosts.json');
    const all = await response.json();
    ghosts = all.ghosts;
    evidences = all.evidences;
    evidencesLogo = all.evidencesLogo;

    for (let i = 0; i < ghosts.length; i++) {
        document.getElementById("eliminatedGhosts").insertAdjacentHTML('beforeend', `<div></div>`);
    }


    ghosts.forEach((ghost, index) => {
        let ghostArticle = `<div><article id="${ghost.name}"><section class="title"><h3>${ghost.name}</h3><ul>`;
        ghost.evidences.forEach(ev => 
            ghostArticle += `<li><img src="src/${evidencesLogo[ev]}" alt="${evidences[ev]}" class="${evidences[ev]}"></li>`
        );
        ghostArticle += `</ul></section><hr><section class="baseInfos">`;

        ghostArticle += `<p>Speed : <p class="speed">${ghost.speedType}</p></p>`;
        ghostArticle += `<p>Hunt sanity : <p class="sanity">${ghost.huntSanity}%</p></p></section>`;

        ghostArticle += `<section class="infos">`
        
        ghostArticle += `<ul class="weakness">`;
        ghost.weakness.forEach(weak =>
            ghostArticle += `<li>${weak}</li>`
        );
        ghostArticle += `</ul>`
        
        ghostArticle += `<ul class="power">`;
        ghost.power.forEach(power => 
            ghostArticle += `<li>${power}</li>`
        );
        ghostArticle += `</ul></section>`

        ghostsContainer.insertAdjacentHTML('beforeend', ghostArticle + `</article></div>`);

        document.getElementById(ghost.name).addEventListener("click", () => {
            showDetails(index);
        });
    })
}

var clickableEvidences = ["temp", "orb", "box", "dots", "emf", "uv", "book"];

clickableEvidences.forEach((ev, index) => {
    let elem = document.getElementById(ev);
    let imgElem = elem.querySelector(`img`);
    elem.addEventListener("click", () => {
        if (elem.classList.contains("selected")) {
            elem.classList.remove("selected");
            imgElem.src = `src/${evidencesLogo[index]}`;
            selected.splice(selected.indexOf(index),1);
        } else {
            elem.classList.add("selected");
            imgElem.src = `src/selected_${evidencesLogo[index]}`;
            selected.push(index);
        }
        selectEvidence(index, imgElem.src);
    });
});

var clickableSpeed = ["fast", "normal", "slow"];

clickableSpeed.forEach((speed, index) => {
    let elem = document.getElementById(speed);
    let imgElem = elem.querySelector(`img`);
    elem.addEventListener("click", () => {
        if (elem.classList.contains("selected")) {
            elem.classList.remove("selected");
            imgElem.src = `src/${speedLogo[index]}`;
            selectedSpeed.splice(selectedSpeed.indexOf(index), 1);
        } else {
            elem.classList.add("selected");
            imgElem.src = `src/selected_${speedLogo[index]}`;
            selectedSpeed.push(index);
        }
        selectSpeed(speed);
    });
});


details.querySelector(".title > button").addEventListener("click", () => {
    details.style.display = "none";
});
details.addEventListener("click", () => {
    details.style.display = "none";
});
details.querySelector("& > article").addEventListener("click", (event) => { 
    event.stopPropagation(); 
});

initGhosts();