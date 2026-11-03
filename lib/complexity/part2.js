// Time / space complexity of the standard solutions for catalog problems
// that have no visualizer (those carry complexity on each approach).
// Keyed by exact problem title.

const complexity = {
    "Longest Palindromic Subsequence": [
        { label: "Brute force (try all subsequences)", time: "O(2ⁿ · n)", space: "O(n)" },
        { label: "DP over substrings", time: "O(n²)", space: "O(n²)" },
    ],
    "Minimum Insertions to Make Palindrome": [
        { label: "Interval DP (n − LPS)", time: "O(n²)", space: "O(n²)" },
    ],
    "Edit Distance": [
        { label: "Plain recursion", time: "O(3ⁿ)", space: "O(n)" },
        { label: "DP table", time: "O(n·m)", space: "O(n·m)" },
    ],
    "Distinct Subsequences": [
        { label: "Plain recursion", time: "O(2ⁿ)", space: "O(n)" },
        { label: "DP with rolling row", time: "O(n·m)", space: "O(m)" },
    ],
    "Wildcard Matching": [
        { label: "DP table", time: "O(n·m)", space: "O(n·m)" },
        { label: "Greedy two pointers with backtrack to last *", time: "O(n·m)", space: "O(1)" },
    ],
    "Stock Trading with Unlimited Transactions": [
        { label: "Sum of every upward step", time: "O(n)", space: "O(1)" },
    ],
    "Stock Trading with Two Transactions": [
        { label: "DP with four running states", time: "O(n)", space: "O(1)" },
    ],
    "Stock Trading with K Transactions": [
        { label: "DP over transactions", time: "O(n·k)", space: "O(k)" },
    ],
    "Stock Trading with Cooldown": [
        { label: "State machine DP (hold / sold / rest)", time: "O(n)", space: "O(1)" },
    ],
    "Stock Trading with Transaction Fee": [
        { label: "State machine DP (hold / free)", time: "O(n)", space: "O(1)" },
    ],
    "Number of Longest Increasing Subsequences": [
        { label: "DP (length and count per index)", time: "O(n²)", space: "O(n)" },
        { label: "Segment tree / BIT over compressed values", time: "O(n log n)", space: "O(n)" },
    ],
    "Matrix Chain Multiplication": [
        { label: "Interval DP", time: "O(n³)", space: "O(n²)" },
    ],
    "Burst Balloons": [
        { label: "Interval DP (last balloon to burst)", time: "O(n³)", space: "O(n²)" },
    ],
    "Palindrome Partitioning Min Cuts": [
        { label: "Palindrome table + cut DP", time: "O(n²)", space: "O(n²)" },
        { label: "Expand around centers + cut DP", time: "O(n²)", space: "O(n)" },
    ],
    "Maximal Square": [
        { label: "DP table", time: "O(r·c)", space: "O(r·c)" },
        { label: "DP with rolling row", time: "O(r·c)", space: "O(c)" },
    ],
    "Count Square Submatrices": [
        { label: "DP table", time: "O(r·c)", space: "O(r·c)" },
        { label: "DP with rolling row", time: "O(r·c)", space: "O(c)" },
    ],
    "BFS Traversal of a Graph": [
        { label: "Queue-based BFS", time: "O(n + m)", space: "O(n + m)" },
    ],
    "DFS Traversal of a Graph": [
        { label: "Recursive DFS", time: "O(n + m)", space: "O(n + m)" },
    ],
    "Number of Provinces": [
        { label: "DFS / Union-Find on adjacency matrix", time: "O(n²)", space: "O(n)" },
    ],
    "Flood Fill": [
        { label: "DFS / BFS from the start pixel", time: "O(r·c)", space: "O(r·c)" },
    ],
    "Rotting Oranges": [
        { label: "Multi-source BFS", time: "O(r·c)", space: "O(r·c)" },
    ],
    "Distance to Nearest Zero": [
        { label: "BFS from every cell", time: "O((r·c)²)", space: "O(r·c)" },
        { label: "Multi-source BFS from all zeros", time: "O(r·c)", space: "O(r·c)" },
    ],
    "Surrounded Regions": [
        { label: "DFS/BFS from border O's", time: "O(r·c)", space: "O(r·c)" },
    ],
    "Number of Enclaves": [
        { label: "Multi-source BFS from border land", time: "O(r·c)", space: "O(r·c)" },
    ],
    "Detect Cycle in an Undirected Graph": [
        { label: "DFS/BFS tracking parent", time: "O(n + m)", space: "O(n + m)" },
    ],
    "Is Graph Bipartite": [
        { label: "BFS/DFS 2-coloring", time: "O(n + m)", space: "O(n + m)" },
    ],
    "Detect Cycle in a Directed Graph": [
        { label: "DFS with recursion stack / Kahn's algorithm", time: "O(n + m)", space: "O(n + m)" },
    ],
    "Topological Sort": [
        { label: "Kahn's algorithm with min-heap", time: "O(n log n + m)", space: "O(n + m)" },
    ],
    "Course Schedule": [
        { label: "Kahn's algorithm (topological sort)", time: "O(n + m)", space: "O(n + m)" },
    ],
    "Shortest Path in an Unweighted Graph": [
        { label: "BFS from s", time: "O(n + m)", space: "O(n + m)" },
    ],
    "Shortest Path in a Binary Maze": [
        { label: "BFS on the grid", time: "O(r·c)", space: "O(r·c)" },
    ],
    "Word Ladder Length": [
        { label: "BFS, compare each pair of words", time: "O(n² · L)", space: "O(n)" },
        { label: "BFS, try every letter change (L = word length)", time: "O(n · L²)", space: "O(n · L)" },
    ],
    "Dijkstra's Shortest Paths": [
        { label: "Dijkstra with min-heap", time: "O((n + m) log n)", space: "O(n + m)" },
    ],
    "Network Delay Time": [
        { label: "Dijkstra with min-heap", time: "O((n + m) log n)", space: "O(n + m)" },
    ],
    "Cheapest Flights Within K Stops": [
        { label: "Bellman-Ford limited to k + 1 rounds", time: "O(k · m)", space: "O(n)" },
    ],
    "Bellman-Ford with Negative Cycle Detection": [
        { label: "Relax all edges n − 1 times, then one more", time: "O(n · m)", space: "O(n)" },
    ],
    "Floyd-Warshall All Pairs": [
        { label: "Floyd-Warshall DP", time: "O(n³)", space: "O(n²)" },
    ],
    "Minimum Spanning Tree Weight": [
        { label: "Kruskal with Union-Find", time: "O(m log m)", space: "O(n)" },
    ],
    "Number of Operations to Connect the Network": [
        { label: "Union-Find (count components, check m ≥ n − 1)", time: "O(n + m)", space: "O(n)" },
    ],
    "Assign Cookies": [
        { label: "Sort both, two pointers", time: "O(n log n + m log m)", space: "O(1)" },
    ],
    "Lemonade Change": [
        { label: "Greedy, count 5s and 10s", time: "O(n)", space: "O(1)" },
    ],
    "Shortest Job First": [
        { label: "Sort burst times, running sum", time: "O(n log n)", space: "O(1)" },
    ],
    "Can You Reach the End": [
        { label: "Greedy farthest reach", time: "O(n)", space: "O(1)" },
    ],
    "Minimum Jumps to the End": [
        { label: "DP over indices", time: "O(n²)", space: "O(n)" },
        { label: "Greedy level-by-level", time: "O(n)", space: "O(1)" },
    ],
    "Maximum Meetings in One Room": [
        { label: "Sort by end time, greedy pick", time: "O(n log n)", space: "O(n)" },
    ],
    "Minimum Platforms": [
        { label: "Compare every pair of trains", time: "O(n²)", space: "O(1)" },
        { label: "Sort arrivals and departures, two pointers", time: "O(n log n)", space: "O(1)" },
    ],
    "Fractional Knapsack": [
        { label: "Sort by value/weight ratio, greedy", time: "O(n log n)", space: "O(n)" },
    ],
    "Job Sequencing": [
        { label: "Sort by profit, scan for a free slot (d = max deadline)", time: "O(n log n + n·d)", space: "O(d)" },
        { label: "Sort by profit, Union-Find for free slot", time: "O(n log n)", space: "O(d)" },
    ],
    "Insert an Interval": [
        { label: "Single linear pass", time: "O(n)", space: "O(1)" },
    ],
    "Non-overlapping Intervals": [
        { label: "Sort by end, greedy keep", time: "O(n log n)", space: "O(1)" },
    ],
    "Gas Station Circuit": [
        { label: "Try every start station", time: "O(n²)", space: "O(1)" },
        { label: "Single pass with running tank", time: "O(n)", space: "O(1)" },
    ],
    "Wildcard Parentheses": [
        { label: "Try every choice for each *", time: "O(3ⁿ)", space: "O(n)" },
        { label: "Greedy min/max open count", time: "O(n)", space: "O(1)" },
    ],
    "Candy Distribution": [
        { label: "Left and right passes", time: "O(n)", space: "O(n)" },
        { label: "Single pass counting slopes", time: "O(n)", space: "O(1)" },
    ],
    "Highest and Lowest Frequency Element": [
        { label: "Frequency hash map", time: "O(n)", space: "O(n)" },
    ],
    "Isomorphic Strings": [
        { label: "Two hash maps (fixed alphabet)", time: "O(n)", space: "O(1)" },
    ],
    "Distinct Elements in Every Window": [
        { label: "Recount each window", time: "O(n·k)", space: "O(k)" },
        { label: "Sliding window with frequency map", time: "O(n)", space: "O(k)" },
    ],
    "Valid Sudoku": [
        { label: "Row / column / box hash sets (fixed 9×9 board)", time: "O(1)", space: "O(1)" },
    ],
    "Longest Subarray with Sum K": [
        { label: "Check every subarray", time: "O(n²)", space: "O(1)" },
        { label: "Prefix sums in a hash map", time: "O(n)", space: "O(n)" },
    ],
    "Count Subarrays with XOR K": [
        { label: "Check every subarray", time: "O(n²)", space: "O(1)" },
        { label: "Prefix XOR in a hash map", time: "O(n)", space: "O(n)" },
    ],
    "Kth Smallest Element": [
        { label: "Sort", time: "O(n log n)", space: "O(1)" },
        { label: "Max-heap of size k", time: "O(n log k)", space: "O(k)" },
    ],
    "Last Stone Weight": [
        { label: "Max-heap simulation", time: "O(n log n)", space: "O(n)" },
    ],
    "Minimum Cost to Connect Ropes": [
        { label: "Min-heap, always join two smallest", time: "O(n log n)", space: "O(n)" },
    ],
    "Kth Largest in a Stream": [
        { label: "Min-heap of size k (per number added)", time: "O(log k)", space: "O(k)" },
    ],
    "Sort a Nearly Sorted Array": [
        { label: "Sort everything", time: "O(n log n)", space: "O(1)" },
        { label: "Min-heap of size k + 1", time: "O(n log k)", space: "O(k)" },
    ],
    "Merge K Sorted Arrays": [
        { label: "Concatenate and sort (n = total elements)", time: "O(n log n)", space: "O(n)" },
        { label: "Min-heap of k array heads", time: "O(n log k)", space: "O(k)" },
    ],
    "Top K Frequent Elements": [
        { label: "Count + sort distinct values", time: "O(n log n)", space: "O(n)" },
        { label: "Count + heap of size k", time: "O(n log k)", space: "O(n)" },
    ],
    "K Closest Points to Origin": [
        { label: "Sort by distance", time: "O(n log n)", space: "O(1)" },
        { label: "Max-heap of size k", time: "O(n log k)", space: "O(k)" },
    ],
    "Hand of Straights": [
        { label: "Sort + count map, build groups from smallest", time: "O(n log n)", space: "O(n)" },
    ],
    "Task Scheduler": [
        { label: "Greedy using max frequency (T = number of tasks)", time: "O(T)", space: "O(1)" },
    ],
    "Find Median from Data Stream": [
        { label: "Sorted array insertion (add O(n), median O(1))", time: "O(n) per add", space: "O(n)" },
        { label: "Two heaps (max-heap low, min-heap high)", time: "O(log n) add, O(1) median", space: "O(n)" },
    ],
    "Linked List Length": [
        { label: "Walk the list", time: "O(n)", space: "O(1)" },
    ],
    "Insert Node at Position": [
        { label: "Walk to position − 1, relink", time: "O(n)", space: "O(1)" },
    ],
    "Delete Node with Value": [
        { label: "Walk with previous pointer", time: "O(n)", space: "O(1)" },
    ],
    "Remove Duplicates from Sorted List": [
        { label: "Single pass, skip equal neighbours", time: "O(n)", space: "O(1)" },
    ],
    "Palindrome Linked List": [
        { label: "Copy values to an array", time: "O(n)", space: "O(n)" },
        { label: "Reverse second half in place", time: "O(n)", space: "O(1)" },
    ],
    "Delete the Middle Node": [
        { label: "Slow/fast pointers", time: "O(n)", space: "O(1)" },
    ],
    "Odd Even Linked List": [
        { label: "Relink odd and even chains", time: "O(n)", space: "O(1)" },
    ],
    "Sort a 0-1-2 Linked List": [
        { label: "Relink into three lists", time: "O(n)", space: "O(1)" },
    ],
    "Swap Nodes in Pairs": [
        { label: "Iterative pointer relinking", time: "O(n)", space: "O(1)" },
    ],
    "Add Two Numbers": [
        { label: "Digit-by-digit with carry (n, m = list lengths)", time: "O(max(n, m))", space: "O(1)" },
    ],
    "Rotate List": [
        { label: "Make circular, cut at new tail", time: "O(n)", space: "O(1)" },
    ],
    "Reverse Sublist Between Positions": [
        { label: "Single-pass in-place reversal", time: "O(n)", space: "O(1)" },
    ],
    "Partition List": [
        { label: "Two dummy lists, then join", time: "O(n)", space: "O(1)" },
    ],
    "Sort Linked List": [
        { label: "Copy to array and sort", time: "O(n log n)", space: "O(n)" },
        { label: "Merge sort on the list", time: "O(n log n)", space: "O(log n)" },
    ],
};

export default complexity;
