const fs = require('fs');
const { QuadTreeNode } = require('../unique/quadtree');

const checkCim = (referenceQt, item) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lng);
    const fet = item.fet;
    const presentInQuadTree = referenceQt.locationIsOnTree(lat, lng, 50);

    if (!fet && presentInQuadTree) {
        console.log(`Considered not done, but found in tracks! ${item.name} - ${item.link}`)
    }

    if (fet && !presentInQuadTree) {
        console.log(`Considered done but not found in tracks! ${item.name} - ${item.link}`)
    }
}

(async () => {
    // To read and deserialize it back:
    const quadtreeData = fs.readFileSync("scripts/quadtree.bin");
    const referenceQt = QuadTreeNode.deserialize(quadtreeData);

    const centCims = JSON.parse(fs.readFileSync("/tmp/100cims.json"));
    const mendikat = JSON.parse(fs.readFileSync("/tmp/mendikat.json"));

    const cims = centCims//.concat(mendikat);
    console.log("** Checking 100 cims ... **")
    centCims.forEach(item => checkCim(referenceQt, item));
    console.log("** Checking mendikat ... **")
    mendikat.forEach(item => checkCim(referenceQt, item));
})();