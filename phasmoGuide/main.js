var ghosts;
var evidences;
var evidencesLogo;

const initGhosts = async () => {
    /**
     * AJAX
     *
     * Faire une requête AJAX à l'API : /api.php
     * L'objet récupéré est un tableau d'objets.
     * L'objet contient les propriétés suivantes :
     * - id : number
     * - title : string
     * - date : string (format : YYYY-MM-DD)
     * - content : string
     *
     * Créer un article pour chaque objet récupéré (pour le format cf. les articles actuellement dans le fichier index.html).
     * L'article contient un titre (h2), une date (p) et un contenu (p).
     * Ajouter chaque article créé dans la section "articles" du fichier index.html à la place des éléments existants.
     */

    const ghostsContainer = document.getElementById("ghostsContainer");
    const response = await fetch('./src/ghosts.json');
    const all = await response.json();
    ghosts = all.ghosts;
    evidences = all.evidences;
    evidencesLogo = all.evidencesLogo;

    ghosts.forEach((ghost) => {
        let ghostArticle = `<article><div><h3>${ghost.name}</h3><ul>`;
        ghost.evidences.forEach(ev => 
            ghostArticle += `<li><img src="src/${evidencesLogo[ev]}" alt="${evidences[ev]} class="${evidences[ev]}"></li>`
        )
        ghostArticle += `</ul></div>`;

        ghostArticle += `Speed : ${ghost.speedType}`;

        ghostsContainer.insertAdjacentHTML('beforeend', ghostArticle + `</article>`);
    })
}

initGhosts()
