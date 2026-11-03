// Time / space complexity of the standard solutions for catalog problems
// that have no visualizer (those carry complexity on each approach).
// Keyed by exact problem title.

const complexity = {
    "Left Rotate by One": [
        { label: "In-place shift", time: "O(n)", space: "O(1)" },
    ],
    "Union of Two Sorted Arrays": [
        { label: "Set + sort", time: "O((n + m) log(n + m))", space: "O(n + m)" },
        { label: "Two pointers", time: "O(n + m)", space: "O(1)" },
    ],
    "Max Consecutive Ones": [
        { label: "Single pass counter", time: "O(n)", space: "O(1)" },
    ],
    "Leaders in an Array": [
        { label: "Check every element", time: "O(n²)", space: "O(1)" },
        { label: "Scan from right", time: "O(n)", space: "O(1)" },
    ],
    "Longest Consecutive Sequence": [
        { label: "Sorting", time: "O(n log n)", space: "O(1)" },
        { label: "Hash set", time: "O(n)", space: "O(n)" },
    ],
    "Rearrange by Sign": [
        { label: "Two output slots", time: "O(n)", space: "O(n)" },
    ],
    "Pascal's Triangle": [
        { label: "Build row by row", time: "O(n²)", space: "O(n²)" },
    ],
    "Spiral Matrix": [
        { label: "Shrinking boundaries", time: "O(r·c)", space: "O(1)" },
    ],
    "Rotate Matrix 90 Degrees": [
        { label: "Extra matrix", time: "O(n²)", space: "O(n²)" },
        { label: "Transpose + reverse rows", time: "O(n²)", space: "O(1)" },
    ],
    "Set Matrix Zeroes": [
        { label: "Row and column marker arrays", time: "O(m·n)", space: "O(m + n)" },
        { label: "Use first row/column as markers", time: "O(m·n)", space: "O(1)" },
    ],
    "Next Permutation": [
        { label: "Pivot, swap, reverse suffix", time: "O(n)", space: "O(1)" },
    ],
    "Subarray Sum Equals K": [
        { label: "Brute force", time: "O(n²)", space: "O(1)" },
        { label: "Prefix sum + hash map", time: "O(n)", space: "O(n)" },
    ],
    "Majority Element II": [
        { label: "Counter map", time: "O(n)", space: "O(n)" },
        { label: "Extended Boyer–Moore vote", time: "O(n)", space: "O(1)" },
    ],
    "4Sum": [
        { label: "Brute force", time: "O(n⁴)", space: "O(1)" },
        { label: "Sort + two loops + two pointers", time: "O(n³)", space: "O(1)" },
    ],
    "Maximum Product Subarray": [
        { label: "Brute force", time: "O(n²)", space: "O(1)" },
        { label: "Track running max and min", time: "O(n)", space: "O(1)" },
    ],
    "Count Inversions": [
        { label: "Check every pair", time: "O(n²)", space: "O(1)" },
        { label: "Merge sort", time: "O(n log n)", space: "O(n)" },
    ],
    "Count Digits": [
        { label: "Divide by 10 repeatedly", time: "O(log n)", space: "O(1)" },
    ],
    "Reverse the Digits": [
        { label: "Peel off last digit", time: "O(log n)", space: "O(1)" },
    ],
    "Armstrong Number": [
        { label: "Digit extraction", time: "O(log n)", space: "O(1)" },
    ],
    "Print All Divisors": [
        { label: "Check 1 to n", time: "O(n)", space: "O(1)" },
        { label: "Check up to √n", time: "O(√n)", space: "O(1)" },
    ],
    "Check Prime": [
        { label: "Check 2 to n−1", time: "O(n)", space: "O(1)" },
        { label: "Check up to √n", time: "O(√n)", space: "O(1)" },
    ],
    "GCD and LCM": [
        { label: "Try every divisor", time: "O(min(a, b))", space: "O(1)" },
        { label: "Euclidean algorithm", time: "O(log(min(a, b)))", space: "O(1)" },
    ],
    "Primes up to N": [
        { label: "Trial division each number", time: "O(n√n)", space: "O(1)" },
        { label: "Sieve of Eratosthenes", time: "O(n log log n)", space: "O(n)" },
    ],
    "Power of a Number (mod)": [
        { label: "Multiply n times", time: "O(n)", space: "O(1)" },
        { label: "Fast exponentiation", time: "O(log n)", space: "O(1)" },
    ],
    "Lower and Upper Bound": [
        { label: "Binary search", time: "O(log n)", space: "O(1)" },
    ],
    "Floor and Ceil in Sorted Array": [
        { label: "Binary search", time: "O(log n)", space: "O(1)" },
    ],
    "First and Last Occurrence": [
        { label: "Binary search twice", time: "O(log n)", space: "O(1)" },
    ],
    "Count Occurrences in Sorted Array": [
        { label: "Linear scan", time: "O(n)", space: "O(1)" },
        { label: "Binary search first and last", time: "O(log n)", space: "O(1)" },
    ],
    "Find Minimum in Rotated Sorted Array": [
        { label: "Linear scan", time: "O(n)", space: "O(1)" },
        { label: "Binary search", time: "O(log n)", space: "O(1)" },
    ],
    "Single Element in a Sorted Array": [
        { label: "XOR all elements", time: "O(n)", space: "O(1)" },
        { label: "Binary search on pair parity", time: "O(log n)", space: "O(1)" },
    ],
    "Peak of a Mountain Array": [
        { label: "Linear scan", time: "O(n)", space: "O(1)" },
        { label: "Binary search", time: "O(log n)", space: "O(1)" },
    ],
    "Integer Square Root": [
        { label: "Linear search", time: "O(√n)", space: "O(1)" },
        { label: "Binary search", time: "O(log n)", space: "O(1)" },
    ],
    "Nth Root of a Number": [
        { label: "Binary search on x, compute x^n (m = the number)", time: "O(n·log m)", space: "O(1)" },
    ],
    "Koko Eating Bananas": [
        { label: "Try every speed (M = largest pile)", time: "O(n·M)", space: "O(1)" },
        { label: "Binary search on speed (M = largest pile)", time: "O(n·log M)", space: "O(1)" },
    ],
    "Minimum Days to Make Bouquets": [
        { label: "Try every day (D = latest bloom day)", time: "O(n·D)", space: "O(1)" },
        { label: "Binary search on day (D = latest bloom day)", time: "O(n·log D)", space: "O(1)" },
    ],
    "Smallest Divisor Within Threshold": [
        { label: "Try every divisor (M = largest element)", time: "O(n·M)", space: "O(1)" },
        { label: "Binary search on divisor (M = largest element)", time: "O(n·log M)", space: "O(1)" },
    ],
    "Ship Packages Within D Days": [
        { label: "Try every capacity (S = total weight)", time: "O(n·S)", space: "O(1)" },
        { label: "Binary search on capacity (S = total weight)", time: "O(n·log S)", space: "O(1)" },
    ],
    "Kth Missing Positive Number": [
        { label: "Linear scan", time: "O(n)", space: "O(1)" },
        { label: "Binary search on a[i] − (i + 1)", time: "O(log n)", space: "O(1)" },
    ],
    "Aggressive Cows": [
        { label: "Try every distance (D = max − min position)", time: "O(n log n + n·D)", space: "O(1)" },
        { label: "Sort + binary search on distance (D = max − min position)", time: "O(n log n + n·log D)", space: "O(1)" },
    ],
    "Allocate Books": [
        { label: "Try every page limit (S = total pages)", time: "O(n·S)", space: "O(1)" },
        { label: "Binary search on page limit (S = total pages)", time: "O(n·log S)", space: "O(1)" },
    ],
    "Search a 2D Matrix": [
        { label: "Scan every cell", time: "O(r·c)", space: "O(1)" },
        { label: "Binary search as flat array", time: "O(log(r·c))", space: "O(1)" },
    ],
    "Median of Two Sorted Arrays": [
        { label: "Merge", time: "O(n + m)", space: "O(n + m)" },
        { label: "Binary search on partition", time: "O(log(min(n, m)))", space: "O(1)" },
    ],
    "Check the i-th Bit": [
        { label: "Shift and mask", time: "O(1)", space: "O(1)" },
    ],
    "Set and Clear the i-th Bit": [
        { label: "OR / AND with mask", time: "O(1)", space: "O(1)" },
    ],
    "Check Power of Two": [
        { label: "n & (n − 1)", time: "O(1)", space: "O(1)" },
    ],
    "Count Set Bits": [
        { label: "Check every bit", time: "O(log n)", space: "O(1)" },
        { label: "n & (n − 1) trick (k = set bits)", time: "O(k)", space: "O(1)" },
    ],
    "Minimum Bit Flips": [
        { label: "Count set bits of a XOR b", time: "O(log(max(a, b)))", space: "O(1)" },
    ],
    "XOR from 1 to N": [
        { label: "Loop 1 to n", time: "O(n)", space: "O(1)" },
        { label: "Pattern by n mod 4", time: "O(1)", space: "O(1)" },
    ],
    "XOR of a Range": [
        { label: "Prefix XOR formula", time: "O(1)", space: "O(1)" },
    ],
    "Counting Bits up to N": [
        { label: "Count bits of each number", time: "O(n log n)", space: "O(n)" },
        { label: "DP: bits[i] = bits[i >> 1] + (i & 1)", time: "O(n)", space: "O(n)" },
    ],
    "Two Numbers Appearing Once": [
        { label: "Hash map", time: "O(n)", space: "O(n)" },
        { label: "XOR + split by set bit", time: "O(n)", space: "O(1)" },
    ],
    "Divide Without Multiplying": [
        { label: "Repeated subtraction", time: "O(a / b)", space: "O(1)" },
        { label: "Bit shifting", time: "O(log a)", space: "O(1)" },
    ],
    "Search in a BST": [
        { label: "Walk down (h = tree height)", time: "O(h)", space: "O(1)" },
    ],
    "Insert into a BST": [
        { label: "Walk down to a leaf (h = tree height)", time: "O(h)", space: "O(1)" },
    ],
    "Floor and Ceil in a BST": [
        { label: "Walk down (h = tree height)", time: "O(h)", space: "O(1)" },
    ],
    "Kth Smallest in a BST": [
        { label: "Full inorder into array", time: "O(n)", space: "O(n)" },
        { label: "Inorder, stop at k", time: "O(h + k)", space: "O(h)" },
    ],
    "Kth Largest in a BST": [
        { label: "Full inorder into array", time: "O(n)", space: "O(n)" },
        { label: "Reverse inorder, stop at k", time: "O(h + k)", space: "O(h)" },
    ],
    "Validate BST": [
        { label: "DFS with min/max bounds", time: "O(n)", space: "O(h)" },
    ],
    "LCA in a BST": [
        { label: "Walk down (h = tree height)", time: "O(h)", space: "O(1)" },
    ],
    "Minimum Difference in a BST": [
        { label: "Inorder with previous value", time: "O(n)", space: "O(h)" },
    ],
    "Inorder Successor in a BST": [
        { label: "Walk down (h = tree height)", time: "O(h)", space: "O(1)" },
    ],
    "Delete Node in a BST": [
        { label: "Recursive delete (h = tree height)", time: "O(h)", space: "O(h)" },
    ],
    "Two Sum in a BST": [
        { label: "Hash set", time: "O(n)", space: "O(n)" },
        { label: "Two-pointer BST iterators", time: "O(n)", space: "O(h)" },
    ],
    "Construct BST from Preorder": [
        { label: "Insert one by one", time: "O(n²)", space: "O(h)" },
        { label: "Recursion with upper bound", time: "O(n)", space: "O(h)" },
    ],
    "Recover a BST": [
        { label: "Inorder array + fix", time: "O(n)", space: "O(n)" },
        { label: "Inorder tracking two swapped nodes", time: "O(n)", space: "O(h)" },
    ],
    "Largest BST Subtree": [
        { label: "Validate every subtree", time: "O(n²)", space: "O(h)" },
        { label: "Bottom-up DFS", time: "O(n)", space: "O(h)" },
    ],
    "Frog Jump": [
        { label: "Plain recursion", time: "O(2ⁿ)", space: "O(n)" },
        { label: "DP with two variables", time: "O(n)", space: "O(1)" },
    ],
    "Frog Jump with K Steps": [
        { label: "Plain recursion", time: "O(kⁿ)", space: "O(n)" },
        { label: "DP table", time: "O(n·k)", space: "O(n)" },
    ],
    "House Robber II": [
        { label: "Two linear DPs (skip first / skip last)", time: "O(n)", space: "O(1)" },
    ],
    "Unique Grid Paths": [
        { label: "DP grid", time: "O(m·n)", space: "O(n)" },
        { label: "Combinatorics C(m+n−2, m−1)", time: "O(min(m, n))", space: "O(1)" },
    ],
    "Unique Paths with Obstacles": [
        { label: "DP grid, rolling row", time: "O(m·n)", space: "O(n)" },
    ],
    "Minimum Path Sum": [
        { label: "DP grid, rolling row", time: "O(m·n)", space: "O(n)" },
    ],
    "Triangle Minimum Path": [
        { label: "Bottom-up DP (n rows)", time: "O(n²)", space: "O(n)" },
    ],
    "Minimum Falling Path Sum": [
        { label: "DP row by row", time: "O(n²)", space: "O(n)" },
    ],
    "Subset Sum Exists": [
        { label: "Try all subsets", time: "O(2ⁿ)", space: "O(n)" },
        { label: "1D DP over sums", time: "O(n·target)", space: "O(target)" },
    ],
    "Partition Equal Subset Sum": [
        { label: "1D DP for sum/2 (S = total sum)", time: "O(n·S)", space: "O(S)" },
    ],
    "Minimum Subset Sum Difference": [
        { label: "1D DP over reachable sums (S = total sum)", time: "O(n·S)", space: "O(S)" },
    ],
    "Count Subsets with Sum K": [
        { label: "Try all subsets", time: "O(2ⁿ)", space: "O(n)" },
        { label: "1D DP", time: "O(n·k)", space: "O(k)" },
    ],
    "0/1 Knapsack": [
        { label: "Try all subsets", time: "O(2ⁿ)", space: "O(n)" },
        { label: "1D DP (W = capacity)", time: "O(n·W)", space: "O(W)" },
    ],
    "Coin Change II": [
        { label: "1D DP (n coins)", time: "O(n·amount)", space: "O(amount)" },
    ],
    "Unbounded Knapsack": [
        { label: "1D DP (W = capacity)", time: "O(n·W)", space: "O(W)" },
    ],
    "Rod Cutting": [
        { label: "Plain recursion", time: "O(2ⁿ)", space: "O(n)" },
        { label: "1D DP", time: "O(n²)", space: "O(n)" },
    ],
    "Longest Common Subsequence": [
        { label: "DP table (lengths n, m)", time: "O(n·m)", space: "O(n·m)" },
        { label: "Two rolling rows", time: "O(n·m)", space: "O(min(n, m))" },
    ],
    "Longest Common Substring": [
        { label: "DP table (lengths n, m)", time: "O(n·m)", space: "O(n·m)" },
        { label: "Rolling row", time: "O(n·m)", space: "O(min(n, m))" },
    ],
};

export default complexity;
