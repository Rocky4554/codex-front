// JavaScript / Java / C++ versions of the approaches in ../problems/linkedlist.js.
// Format: see ./README.md.

const translations = {
    "reverse-linked-list": {
        "iterative": {
            javascript: [
                [1, "let prev = null, curr = head;"],
                [2, "while (curr) {"],
                [3, "    const nxt = curr.next;"],
                [4, "    curr.next = prev;      // flip the link"],
                [5, "    prev = curr;"],
                [6, "    curr = nxt;"],
                "}",
                [7, "return prev;               // new head"],
            ],
            java: [
                [1, "ListNode prev = null, curr = head;"],
                [2, "while (curr != null) {"],
                [3, "    ListNode nxt = curr.next;"],
                [4, "    curr.next = prev;      // flip the link"],
                [5, "    prev = curr;"],
                [6, "    curr = nxt;"],
                "}",
                [7, "return prev;               // new head"],
            ],
            cpp: [
                [1, "ListNode* prev = nullptr; ListNode* curr = head;"],
                [2, "while (curr) {"],
                [3, "    ListNode* nxt = curr->next;"],
                [4, "    curr->next = prev;      // flip the link"],
                [5, "    prev = curr;"],
                [6, "    curr = nxt;"],
                "}",
                [7, "return prev;               // new head"],
            ],
        },
    },
};

export default translations;
