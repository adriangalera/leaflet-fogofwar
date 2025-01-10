const fs = require('fs');
const { QuadTreeNode } = require('../unique/quadtree');

(async () => {
    // To read and deserialize it back:
    const quadtreeData = fs.readFileSync("scripts/quadtree.bin");
    const referenceQt = QuadTreeNode.deserialize(quadtreeData);

    const centCims = JSON.parse(fs.readFileSync("/tmp/100cims.json"));
    const mendikat = JSON.parse(fs.readFileSync("/tmp/mendikat.json"));

    const cims = centCims.concat(mendikat);
 
    cims.forEach(item => {
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lng);
        const fet = item.fet;
        const presentInQuadTree = referenceQt.locationIsOnTree(lat, lng, 200);

        if (fet && !presentInQuadTree) {
            console.log(`Cim ${item.name} not found in tracks! ${item.link}`)
        }
        
    });
})();