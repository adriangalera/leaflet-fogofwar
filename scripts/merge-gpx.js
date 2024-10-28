const fs = require('fs');
const { DOMParser, XMLSerializer } = require('xmldom');
const xpath = require('xpath');

// Namespace resolver for the GPX default namespace
const namespaces = { gpx: 'http://www.topografix.com/GPX/1/1' };

// Create a function to select nodes with namespaces
const selectWithNamespace = (expression, node) => {
    return xpath.useNamespaces(namespaces)(expression, node);
};

// Load GPX files
const loadGPXFile = (filePath) => {
    return new DOMParser().parseFromString(fs.readFileSync(filePath, 'utf-8'), 'text/xml');
};

const saveGPXFile = (doc, filePath) => {
    const xml = new XMLSerializer().serializeToString(doc);
    fs.writeFileSync(filePath, xml);
};

// Function to merge points
const mergeGPXFiles = (file1Path, file2Path, outputPath) => {
    // Load the GPX files
    const doc1 = loadGPXFile(file1Path);
    const doc2 = loadGPXFile(file2Path);

    // Get trkseg elements using the namespace resolver
    const trkseg1 = selectWithNamespace('//gpx:trk/gpx:trkseg', doc1)[0];
    const trkseg2 = selectWithNamespace('//gpx:trk/gpx:trkseg', doc2)[0];

    if (!trkseg1 || !trkseg2) {
        console.error('Error: Could not find trkseg elements in one of the files.');
        return;
    }

    // Append each trkpt from file2's trkseg to file1's trkseg
    const points = selectWithNamespace('gpx:trkpt', trkseg2);
    points.forEach(point => {
        const importedPoint = doc1.importNode(point, true);
        trkseg1.appendChild(importedPoint);
    });

    // Save the merged document
    saveGPXFile(doc1, outputPath);
    console.log(`Merged GPX saved to ${outputPath}`);
};

// File paths
const file1Path = 'gpx/5c72f0d4d85e397f56e14ed4.gpx';
const file2Path = 'gpx/5c72f0c5d85e397f56e14c64.gpx';
const outputPath = 'gpx/merged.gpx';

// Merge files
mergeGPXFiles(file1Path, file2Path, outputPath);

console.log(`Merged ${file1Path} and ${file2Path}. Check: http://localhost:3000/unique?t1=merged.gpx`)