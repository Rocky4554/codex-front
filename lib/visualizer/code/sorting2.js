// JavaScript / Java / C++ versions of the approaches in ../problems/sorting2.js.
// Format: see ./README.md.

const translations = {
    "merge-sort": {
        "merge": {
            javascript: [
                [1, "function sort(lo, hi) {"],
                [2, "    if (hi - lo <= 1) return;"],
                [3, "    const mid = Math.floor((lo + hi) / 2);"],
                [4, "    sort(lo, mid); sort(mid, hi);"],
                [5, "    const merged = merge(arr.slice(lo, mid), arr.slice(mid, hi));"],
                [6, "    arr.splice(lo, hi - lo, ...merged);"],
                "}",
            ],
            java: [
                [1, "void sort(int lo, int hi) {"],
                [2, "    if (hi - lo <= 1) return;"],
                [3, "    int mid = (lo + hi) / 2;"],
                [4, "    sort(lo, mid); sort(mid, hi);"],
                [5, "    int[] merged = merge(Arrays.copyOfRange(arr, lo, mid), Arrays.copyOfRange(arr, mid, hi));"],
                [6, "    System.arraycopy(merged, 0, arr, lo, merged.length);"],
                "}",
            ],
            cpp: [
                [1, "void sort(int lo, int hi) {"],
                [2, "    if (hi - lo <= 1) return;"],
                [3, "    int mid = (lo + hi) / 2;"],
                [4, "    sort(lo, mid); sort(mid, hi);"],
                [5, "    vector<int> merged = merge(vector<int>(arr.begin() + lo, arr.begin() + mid), vector<int>(arr.begin() + mid, arr.begin() + hi));"],
                [6, "    copy(merged.begin(), merged.end(), arr.begin() + lo);"],
                "}",
            ],
        },
    },
    "quick-sort": {
        "lomuto": {
            javascript: [
                [1, "function qs(lo, hi) {"],
                [2, "    if (lo >= hi) return;"],
                [3, "    const pivot = arr[hi]; let i = lo;"],
                [4, "    for (let j = lo; j < hi; j++) {"],
                [5, "        if (arr[j] < pivot) { swap(i, j); i++; }"],
                "    }",
                [6, "    swap(i, hi);          // pivot to its spot"],
                [7, "    qs(lo, i - 1); qs(i + 1, hi);"],
                "}",
            ],
            java: [
                [1, "void qs(int lo, int hi) {"],
                [2, "    if (lo >= hi) return;"],
                [3, "    int pivot = arr[hi], i = lo;"],
                [4, "    for (int j = lo; j < hi; j++) {"],
                [5, "        if (arr[j] < pivot) { swap(i, j); i++; }"],
                "    }",
                [6, "    swap(i, hi);          // pivot to its spot"],
                [7, "    qs(lo, i - 1); qs(i + 1, hi);"],
                "}",
            ],
            cpp: [
                [1, "void qs(int lo, int hi) {"],
                [2, "    if (lo >= hi) return;"],
                [3, "    int pivot = arr[hi], i = lo;"],
                [4, "    for (int j = lo; j < hi; j++) {"],
                [5, "        if (arr[j] < pivot) { swap(arr[i], arr[j]); i++; }"],
                "    }",
                [6, "    swap(arr[i], arr[hi]);          // pivot to its spot"],
                [7, "    qs(lo, i - 1); qs(i + 1, hi);"],
                "}",
            ],
        },
    },
    "selection-sort": {
        "selection": {
            javascript: [
                [1, "for (let i = 0; i < n - 1; i++) {"],
                [2, "    let m = i;"],
                [3, "    for (let j = i + 1; j < n; j++) {"],
                [4, "        if (arr[j] < arr[m]) m = j;"],
                "    }",
                [5, "    [arr[i], arr[m]] = [arr[m], arr[i]];"],
                "}",
                [6, "console.log(arr.join(\" \"));"],
            ],
            java: [
                [1, "for (int i = 0; i < n - 1; i++) {"],
                [2, "    int m = i;"],
                [3, "    for (int j = i + 1; j < n; j++) {"],
                [4, "        if (arr[j] < arr[m]) m = j;"],
                "    }",
                [5, "    int tmp = arr[i]; arr[i] = arr[m]; arr[m] = tmp;"],
                "}",
                [6, "System.out.println(Arrays.toString(arr));"],
            ],
            cpp: [
                [1, "for (int i = 0; i < n - 1; i++) {"],
                [2, "    int m = i;"],
                [3, "    for (int j = i + 1; j < n; j++) {"],
                [4, "        if (arr[j] < arr[m]) m = j;"],
                "    }",
                [5, "    swap(arr[i], arr[m]);"],
                "}",
                [6, "for (int x : arr) cout << x << \" \";"],
                "cout << endl;",
            ],
        },
    },
};

export default translations;
