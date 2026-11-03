// Time / space complexity of the standard solutions for catalog problems
// that have no visualizer (those carry complexity on each approach).
// Keyed by exact problem title.

const complexity = {
    "Reverse Nodes in k-Group": [
        { label: "Reverse k at a time in place", time: "O(n)", space: "O(1)" },
    ],
    "Merge K Sorted Lists": [
        { label: "Collect all and sort", time: "O(N log N)", space: "O(N)" },
        { label: "Min-heap of k heads (N = total nodes)", time: "O(N log k)", space: "O(k)" },
    ],
    "Binary Strings Without Consecutive Ones": [
        { label: "Backtracking (append 1 only after 0)", time: "O(n·1.618ⁿ)", space: "O(n)" },
    ],
    "Generate Parentheses": [
        { label: "Backtracking (open/close counts)", time: "O(4ⁿ/√n)", space: "O(n)" },
    ],
    "Subsets (Power Set)": [
        { label: "Take / skip recursion", time: "O(n·2ⁿ)", space: "O(n)" },
    ],
    "Subset Sums": [
        { label: "Take / skip recursion", time: "O(2ⁿ)", space: "O(n)" },
    ],
    "Subsets With Duplicates": [
        { label: "Sort + skip duplicates", time: "O(n·2ⁿ)", space: "O(n)" },
    ],
    "Combination Sum": [
        { label: "Backtracking (t = target, m = smallest candidate)", time: "O(n^(t/m))", space: "O(t/m)" },
    ],
    "Combination Sum II": [
        { label: "Sort + backtracking, skip duplicates", time: "O(n·2ⁿ)", space: "O(n)" },
    ],
    "Combination Sum III": [
        { label: "Backtracking over digits 1–9", time: "O(k·C(9, k))", space: "O(k)" },
    ],
    "Permutations": [
        { label: "Backtracking with used[] or swaps", time: "O(n·n!)", space: "O(n)" },
    ],
    "Letter Combinations of a Phone Number": [
        { label: "Backtracking", time: "O(n·4ⁿ)", space: "O(n)" },
    ],
    "Palindrome Partitioning": [
        { label: "Backtracking + palindrome check", time: "O(n·2ⁿ)", space: "O(n)" },
    ],
    "Word Search": [
        { label: "DFS backtracking (word length L)", time: "O(m·n·3ᴸ)", space: "O(L)" },
    ],
    "Rat in a Maze": [
        { label: "DFS backtracking with visited", time: "O(4^(n²))", space: "O(n²)" },
    ],
    "N-Queens": [
        { label: "Backtracking with column/diagonal sets", time: "O(n!)", space: "O(n)" },
    ],
    "Graph M-Coloring": [
        { label: "Backtracking (n vertices, k colors)", time: "O(n·kⁿ)", space: "O(n)" },
    ],
    "Sudoku Solver": [
        { label: "Backtracking (m empty cells)", time: "O(9ᵐ)", space: "O(1)" },
    ],
    "Maximum Sum Subarray of Size K": [
        { label: "Brute force", time: "O(n·k)", space: "O(1)" },
        { label: "Sliding window", time: "O(n)", space: "O(1)" },
    ],
    "Maximum Points from Cards": [
        { label: "Prefix of left cards + suffix of right cards", time: "O(k)", space: "O(1)" },
    ],
    "Max Consecutive Ones III": [
        { label: "Sliding window", time: "O(n)", space: "O(1)" },
    ],
    "Minimum Size Subarray Sum": [
        { label: "Brute force", time: "O(n²)", space: "O(1)" },
        { label: "Sliding window", time: "O(n)", space: "O(1)" },
    ],
    "Longest Repeating Character Replacement": [
        { label: "Sliding window with letter counts", time: "O(n)", space: "O(1)" },
    ],
    "Subarray Product Less Than K": [
        { label: "Brute force", time: "O(n²)", space: "O(1)" },
        { label: "Sliding window", time: "O(n)", space: "O(1)" },
    ],
    "Binary Subarrays With Sum": [
        { label: "Prefix sums + hash map", time: "O(n)", space: "O(n)" },
        { label: "atMost(goal) − atMost(goal − 1)", time: "O(n)", space: "O(1)" },
    ],
    "Subarrays with K Different Integers": [
        { label: "Brute force", time: "O(n²)", space: "O(k)" },
        { label: "atMost(k) − atMost(k − 1)", time: "O(n)", space: "O(k)" },
    ],
    "Minimum Window Substring": [
        { label: "Sliding window with counts (s has n chars, t has m)", time: "O(n + m)", space: "O(m)" },
    ],
    "Check if Array Is Sorted": [
        { label: "Compare neighbours", time: "O(n)", space: "O(1)" },
    ],
    "Insertion Sort": [
        { label: "Insertion sort", time: "O(n²)", space: "O(1)" },
    ],
    "Counting Sort": [
        { label: "Count occurrences (k = value range)", time: "O(n + k)", space: "O(k)" },
    ],
    "Sort Array by Parity": [
        { label: "Stable two-pass partition", time: "O(n)", space: "O(n)" },
    ],
    "Sort 0s 1s and 2s": [
        { label: "Count 0s, 1s, 2s then rewrite", time: "O(n)", space: "O(1)" },
        { label: "Dutch national flag (one pass)", time: "O(n)", space: "O(1)" },
    ],
    "Sort by Frequency": [
        { label: "Count frequencies + custom sort", time: "O(n log n)", space: "O(n)" },
    ],
    "Queue Using Two Stacks": [
        { label: "Inbox/outbox stacks (per operation, amortized)", time: "O(1)", space: "O(n)" },
    ],
    "Evaluate Reverse Polish Notation": [
        { label: "Operand stack", time: "O(n)", space: "O(n)" },
    ],
    "Infix to Postfix": [
        { label: "Operator stack (shunting-yard)", time: "O(n)", space: "O(n)" },
    ],
    "Next Smaller Element": [
        { label: "Brute force", time: "O(n²)", space: "O(1)" },
        { label: "Monotonic stack", time: "O(n)", space: "O(n)" },
    ],
    "Next Greater Element II": [
        { label: "Brute force", time: "O(n²)", space: "O(1)" },
        { label: "Monotonic stack, two passes", time: "O(n)", space: "O(n)" },
    ],
    "Daily Temperatures": [
        { label: "Brute force", time: "O(n²)", space: "O(1)" },
        { label: "Monotonic stack", time: "O(n)", space: "O(n)" },
    ],
    "Stock Span": [
        { label: "Brute force", time: "O(n²)", space: "O(1)" },
        { label: "Monotonic stack", time: "O(n)", space: "O(n)" },
    ],
    "Asteroid Collision": [
        { label: "Stack simulation", time: "O(n)", space: "O(n)" },
    ],
    "Remove K Digits": [
        { label: "Greedy monotonic stack", time: "O(n)", space: "O(n)" },
    ],
    "Sum of Subarray Minimums": [
        { label: "Brute force", time: "O(n²)", space: "O(1)" },
        { label: "Monotonic stack (previous/next smaller)", time: "O(n)", space: "O(n)" },
    ],
    "LRU Cache": [
        { label: "List scan (capacity c, per operation)", time: "O(c)", space: "O(c)" },
        { label: "Hash map + doubly linked list (per operation)", time: "O(1)", space: "O(c)" },
    ],
    "Sliding Window Maximum": [
        { label: "Brute force", time: "O(n·k)", space: "O(1)" },
        { label: "Monotonic deque", time: "O(n)", space: "O(k)" },
    ],
    "Largest Rectangle in Histogram": [
        { label: "Brute force", time: "O(n²)", space: "O(1)" },
        { label: "Monotonic stack", time: "O(n)", space: "O(n)" },
    ],
    "Maximal Rectangle": [
        { label: "Histogram per row (m rows, n columns)", time: "O(m·n)", space: "O(n)" },
    ],
    "Largest Odd Number in String": [
        { label: "Scan from the right for an odd digit", time: "O(n)", space: "O(1)" },
    ],
    "Remove Outermost Parentheses": [
        { label: "Depth counter", time: "O(n)", space: "O(1)" },
    ],
    "Reverse Words in a String": [
        { label: "Split and reverse words", time: "O(n)", space: "O(n)" },
    ],
    "Rotate String Check": [
        { label: "Try every rotation", time: "O(n²)", space: "O(n)" },
        { label: "Search goal in s + s (KMP)", time: "O(n)", space: "O(n)" },
    ],
    "Maximum Nesting Depth of Parentheses": [
        { label: "Depth counter", time: "O(n)", space: "O(1)" },
    ],
    "Roman to Integer": [
        { label: "Left-to-right scan with lookup", time: "O(n)", space: "O(1)" },
    ],
    "Integer to Roman": [
        { label: "Greedy over value table (bounded input)", time: "O(1)", space: "O(1)" },
    ],
    "Sort Characters by Frequency": [
        { label: "Sort all characters by count", time: "O(n log n)", space: "O(n)" },
        { label: "Count + sort distinct characters (k distinct)", time: "O(n + k log k)", space: "O(k)" },
    ],
    "String to Integer": [
        { label: "Single scan", time: "O(n)", space: "O(1)" },
    ],
    "Count Palindromic Substrings": [
        { label: "Brute force", time: "O(n³)", space: "O(1)" },
        { label: "Expand around centers", time: "O(n²)", space: "O(1)" },
    ],
    "Sum of Beauty of All Substrings": [
        { label: "Count letters for every substring (26 letters)", time: "O(26·n²)", space: "O(1)" },
    ],
    "Postorder Traversal": [
        { label: "DFS (h = tree height)", time: "O(n)", space: "O(h)" },
    ],
    "Count Nodes": [
        { label: "DFS (h = tree height)", time: "O(n)", space: "O(h)" },
    ],
    "Same Tree": [
        { label: "Simultaneous DFS (h = tree height)", time: "O(n)", space: "O(h)" },
    ],
    "Symmetric Tree": [
        { label: "Mirror DFS (h = tree height)", time: "O(n)", space: "O(h)" },
    ],
    "Path Sum": [
        { label: "DFS (h = tree height)", time: "O(n)", space: "O(h)" },
    ],
    "All Root-to-Leaf Paths": [
        { label: "DFS with path list (h = tree height)", time: "O(n·h)", space: "O(h)" },
    ],
    "Diameter of Binary Tree": [
        { label: "Height at every node", time: "O(n²)", space: "O(h)" },
        { label: "Single DFS returning height", time: "O(n)", space: "O(h)" },
    ],
    "Right Side View": [
        { label: "BFS by level (w = max width)", time: "O(n)", space: "O(w)" },
    ],
    "Zigzag Level Order Traversal": [
        { label: "BFS by level, alternate direction", time: "O(n)", space: "O(n)" },
    ],
    "Top View of a Tree": [
        { label: "BFS with column map", time: "O(n)", space: "O(n)" },
    ],
    "Bottom View of a Tree": [
        { label: "BFS with column map", time: "O(n)", space: "O(n)" },
    ],
    "Boundary Traversal": [
        { label: "Left edge + leaves + right edge (h = tree height)", time: "O(n)", space: "O(h)" },
    ],
    "Vertical Order Traversal": [
        { label: "DFS/BFS + sort by (column, row, value)", time: "O(n log n)", space: "O(n)" },
    ],
    "Lowest Common Ancestor": [
        { label: "Recursive DFS (h = tree height)", time: "O(n)", space: "O(h)" },
    ],
    "Maximum Width of Binary Tree": [
        { label: "BFS with position indices", time: "O(n)", space: "O(n)" },
    ],
    "Nodes at Distance K": [
        { label: "Parent map + BFS from target", time: "O(n)", space: "O(n)" },
    ],
    "Minimum Time to Burn the Tree": [
        { label: "Parent map + BFS from start", time: "O(n)", space: "O(n)" },
    ],
    "Construct Tree from Preorder and Inorder": [
        { label: "Linear search in inorder", time: "O(n²)", space: "O(h)" },
        { label: "Hash map of inorder indices", time: "O(n)", space: "O(n)" },
    ],
    "Flatten Tree to Linked List": [
        { label: "Stack / recursion (h = tree height)", time: "O(n)", space: "O(h)" },
        { label: "Morris-style rewiring", time: "O(n)", space: "O(1)" },
    ],
    "Maximum Path Sum": [
        { label: "Single DFS (h = tree height)", time: "O(n)", space: "O(h)" },
    ],
    "Implement a Trie": [
        { label: "Trie (L = word length, per operation; N words stored)", time: "O(L)", space: "O(N·L)" },
    ],
    "Trie With Counts and Erase": [
        { label: "Trie with counters (L = word length, per operation; N words stored)", time: "O(L)", space: "O(N·L)" },
    ],
    "Longest Word With All Prefixes": [
        { label: "Hash set, check every prefix (n words, max length L)", time: "O(n·L²)", space: "O(n·L)" },
        { label: "Trie (n words, max length L)", time: "O(n·L)", space: "O(n·L)" },
    ],
    "Count Distinct Substrings": [
        { label: "Hash set of all substrings", time: "O(n³)", space: "O(n²)" },
        { label: "Trie of all suffixes", time: "O(n²)", space: "O(n²)" },
    ],
    "Maximum XOR of Two Numbers": [
        { label: "Brute force", time: "O(n²)", space: "O(1)" },
        { label: "Binary trie (31 bits)", time: "O(n)", space: "O(n)" },
    ],
    "Maximum XOR With a Limit": [
        { label: "Check every element per query (q queries)", time: "O(n·q)", space: "O(1)" },
        { label: "Sort offline + binary trie", time: "O(n log n + q log q)", space: "O(n + q)" },
    ],
};

export default complexity;
