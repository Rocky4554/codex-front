// JavaScript / Java / C++ versions of the approaches in ../problems/sorting.js.
// Format: see ./README.md.

const translations = {
    "bubble-sort": {
        "bubble": {
            javascript: [
                [1, "for (let i = 0; i < n - 1; i++) {"],
                [2, "    let swapped = false;"],
                [3, "    for (let j = 0; j < n - 1 - i; j++) {"],
                [4, "        if (arr[j] > arr[j + 1]) {"],
                [5, "            [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];"],
                [6, "            swapped = true;"],
                "        }",
                "    }",
                [7, "    if (!swapped) break;"],
                "}",
            ],
            java: [
                [1, "for (int i = 0; i < n - 1; i++) {"],
                [2, "    boolean swapped = false;"],
                [3, "    for (int j = 0; j < n - 1 - i; j++) {"],
                [4, "        if (arr[j] > arr[j + 1]) {"],
                [5, "            int tmp = arr[j]; arr[j] = arr[j + 1]; arr[j + 1] = tmp;"],
                [6, "            swapped = true;"],
                "        }",
                "    }",
                [7, "    if (!swapped) break;"],
                "}",
            ],
            cpp: [
                [1, "for (int i = 0; i < n - 1; i++) {"],
                [2, "    bool swapped = false;"],
                [3, "    for (int j = 0; j < n - 1 - i; j++) {"],
                [4, "        if (arr[j] > arr[j + 1]) {"],
                [5, "            swap(arr[j], arr[j + 1]);"],
                [6, "            swapped = true;"],
                "        }",
                "    }",
                [7, "    if (!swapped) break;"],
                "}",
            ],
        },
    },
};

export default translations;
