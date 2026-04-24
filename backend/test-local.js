const data = [
  "A->B", "A->C", "B->D", "C->E", "E->F",
  "X->Y", "Y->Z", "Z->X",
  "P->Q", "Q->R",
  "G->H", "G->H", "G->I",
  "hello", "1->2", "A->"
];

const invalid_entries = [];
const duplicate_edges = [];
const validEdges = [];

const seenEdges = new Set();
const duplicatedEdgesSet = new Set();

// Step 1 & 2: Validation & Duplicate Detection
for (let i = 0; i < data.length; i++) {
    let entry = data[i];
    if (typeof entry !== 'string') {
        invalid_entries.push(entry);
        continue;
    }
    
    entry = entry.trim();
    const regex = /^[A-Z]->[A-Z]$/;
    if (!regex.test(entry)) {
        invalid_entries.push(entry);
        continue;
    }
    
    const [u, v] = entry.split('->');
    if (u === v) {
        invalid_entries.push(entry); // Self-loops are invalid
        continue;
    }
    
    if (seenEdges.has(entry)) {
        if (!duplicatedEdgesSet.has(entry)) {
            duplicatedEdgesSet.add(entry);
            duplicate_edges.push(entry);
        }
    } else {
        seenEdges.add(entry);
        validEdges.push([u, v]);
    }
}

const children = {};
const parentCount = {};
const nodes = new Set();
const finalEdges = [];

const parentMap = {};

for (const [u, v] of validEdges) {
    if (!children[u]) children[u] = [];
    if (!children[v]) children[v] = [];
    
    nodes.add(u);
    nodes.add(v);
    
    if (parentCount[u] === undefined) parentCount[u] = 0;
    if (parentCount[v] === undefined) parentCount[v] = 0;
    
    // Step 4: Multi-parent rule - silently discard
    if (parentMap[v] !== undefined) {
        continue;
    }
    
    parentMap[v] = u;
    children[u].push(v);
    parentCount[v] += 1;
    finalEdges.push([u, v]);
}

const adjUndirected = {};
for (const node of nodes) {
    adjUndirected[node] = [];
}
for (const [u, v] of finalEdges) {
    adjUndirected[u].push(v);
    adjUndirected[v].push(u);
}

const visited = new Set();
const components = [];

for (const node of nodes) {
    if (!visited.has(node)) {
        const compNodes = [];
        const queue = [node];
        visited.add(node);
        
        while (queue.length > 0) {
            const curr = queue.shift();
            compNodes.push(curr);
            
            for (const neighbor of adjUndirected[curr]) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push(neighbor);
                }
            }
        }
        components.push(compNodes);
    }
}

const hierarchies = [];
let total_trees = 0;
let total_cycles = 0;

for (const compNodes of components) {
    let possibleRoots = compNodes.filter(n => parentCount[n] === 0);
    
    let root;
    if (possibleRoots.length === 0) {
        compNodes.sort();
        root = compNodes[0];
    } else if (possibleRoots.length === 1) {
        root = possibleRoots[0];
    } else {
        possibleRoots.sort();
        root = possibleRoots[0];
    }
    
    const color = {};
    for (const n of compNodes) color[n] = 0;
    
    let hasCycle = false;
    
    function dfsCycle(curr) {
        color[curr] = 1;
        for (const child of children[curr] || []) {
            if (color[child] === 1) {
                hasCycle = true;
            } else if (color[child] === 0) {
                dfsCycle(child);
            }
        }
        color[curr] = 2;
    }
    
    for (const n of compNodes) {
        if (color[n] === 0) {
            dfsCycle(n);
        }
    }
    
    if (hasCycle) {
        hierarchies.push({
            root: root,
            tree: {},
            has_cycle: true
        });
        total_cycles += 1;
    } else {
        function buildTree(curr) {
            const nodeObj = {};
            let maxDepth = 1;
            for (const child of children[curr] || []) {
                const { tree: childTree, depth: childDepth } = buildTree(child);
                nodeObj[child] = childTree;
                if (childDepth + 1 > maxDepth) {
                    maxDepth = childDepth + 1;
                }
            }
            return { tree: nodeObj, depth: maxDepth };
        }
        
        const { tree, depth } = buildTree(root);
        hierarchies.push({
            root: root,
            tree: { [root]: tree },
            depth: depth
        });
        total_trees += 1;
    }
}

hierarchies.sort((a, b) => a.root.localeCompare(b.root));

let largest_tree_root = null;
let max_depth = 0;

for (const h of hierarchies) {
    if (!h.has_cycle) {
        if (h.depth > max_depth) {
            max_depth = h.depth;
            largest_tree_root = h.root;
        } else if (h.depth === max_depth) {
            if (!largest_tree_root || h.root < largest_tree_root) {
                largest_tree_root = h.root;
            }
        }
    }
}

console.log(JSON.stringify({
    hierarchies,
    invalid_entries,
    duplicate_edges,
    summary: {
        total_trees,
        total_cycles,
        largest_tree_root
    }
}, null, 2));
