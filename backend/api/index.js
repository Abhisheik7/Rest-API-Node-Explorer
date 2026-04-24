const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/bfhl', (req, res) => {
  const data = req.body.data || [];

  const invalid_entries = [];
  const seen_edges = new Set();
  const duplicate_edges = [];
  const valid_edges = [];
  const assigned_parent = {};
  const children = {};
  const all_nodes = new Set();

  // Step 1: Validate
  for (let raw of data) {
    const entry = typeof raw === 'string' ? raw.trim() : '';
    if (!/^[A-Z]->[A-Z]$/.test(entry) || entry[0] === entry[3]) {
      invalid_entries.push(raw);
      continue;
    }
    // Step 2: Duplicates
    if (seen_edges.has(entry)) {
      if (!duplicate_edges.includes(entry)) duplicate_edges.push(entry);
      continue;
    }
    seen_edges.add(entry);
    valid_edges.push(entry);
  }

  // Step 3 & 4: Build adjacency with multi-parent rule
  for (let edge of valid_edges) {
    const [parent, child] = edge.split('->');
    all_nodes.add(parent);
    all_nodes.add(child);
    if (assigned_parent[child] !== undefined) continue; // silent discard
    assigned_parent[child] = parent;
    if (!children[parent]) children[parent] = [];
    children[parent].push(child);
  }

  // Step 5: Union-Find to group connected components
  const parent_uf = {};
  const find = (x) => { if (!parent_uf[x]) parent_uf[x] = x; if (parent_uf[x] !== x) parent_uf[x] = find(parent_uf[x]); return parent_uf[x]; };
  const union = (a, b) => { parent_uf[find(a)] = find(b); };
  for (let edge of valid_edges) { const [p, c] = edge.split('->'); union(p, c); }
  const groups = {};
  for (let node of all_nodes) { const root = find(node); if (!groups[root]) groups[root] = []; groups[root].push(node); }

  // Step 6: Process each component
  const hierarchies = [];
  for (let group of Object.values(groups)) {
    const node_set = new Set(group);
    const roots = group.filter(n => !assigned_parent[n]).sort();
    const root = roots.length > 0 ? roots[0] : group.sort()[0];

    // Cycle detection via DFS
    let has_cycle = false;
    const visited = new Set();
    const rec_stack = new Set();
    const dfs_cycle = (node) => {
      visited.add(node); rec_stack.add(node);
      for (let child of (children[node] || [])) {
        if (!visited.has(child)) { if (dfs_cycle(child)) return true; }
        else if (rec_stack.has(child)) return true;
      }
      rec_stack.delete(node); return false;
    };
    for (let node of group) { if (!visited.has(node) && dfs_cycle(node)) { has_cycle = true; break; } }

    if (has_cycle) {
      hierarchies.push({ root, tree: {}, has_cycle: true });
    } else {
      const build_tree = (node) => { const obj = {}; for (let child of (children[node] || [])) obj[child] = build_tree(child); return obj; };
      const tree = { [root]: build_tree(root) };
      const get_depth = (node) => { const kids = children[node] || []; if (kids.length === 0) return 1; return 1 + Math.max(...kids.map(get_depth)); };
      const depth = get_depth(root);
      hierarchies.push({ root, tree, depth });
    }
  }

  // Sort hierarchies: non-cyclic first, then by root alphabetically
  hierarchies.sort((a, b) => a.root.localeCompare(b.root));

  // Step 7: Summary
  const trees = hierarchies.filter(h => !h.has_cycle);
  const cycles = hierarchies.filter(h => h.has_cycle);
  let largest_tree_root = '';
  if (trees.length > 0) {
    const max_depth = Math.max(...trees.map(t => t.depth));
    const candidates = trees.filter(t => t.depth === max_depth).map(t => t.root).sort();
    largest_tree_root = candidates[0];
  }

  res.json({
    user_id: "abhisheik7",
    email_id: "ay3197@srmist.edu.in",
    college_roll_number: "RA2311003020310",
    hierarchies,
    invalid_entries,
    duplicate_edges,
    summary: {
      total_trees: trees.length,
      total_cycles: cycles.length,
      largest_tree_root
    }
  });
});

module.exports = app;
