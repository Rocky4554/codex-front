// JavaScript / Java / C++ versions of the approaches in ../problems/trees.js.
// Format: see ./README.md.

const translations = {
    "inorder-traversal": {
        recursive: {
            javascript: [
                [1, "function inorder(node) {"],
                [2, "    if (!node) return;"],
                [3, "    inorder(node.left);"],
                [4, "    out.push(node.val);   // visit"],
                [5, "    inorder(node.right);"],
                "}",
            ],
            java: [
                [1, "static void inorder(TreeNode node, List<Integer> out) {"],
                [2, "    if (node == null) return;"],
                [3, "    inorder(node.left, out);"],
                [4, "    out.add(node.val);   // visit"],
                [5, "    inorder(node.right, out);"],
                "}",
            ],
            cpp: [
                [1, "void inorder(TreeNode* node, vector<int>& out) {"],
                [2, "    if (!node) return;"],
                [3, "    inorder(node->left, out);"],
                [4, "    out.push_back(node->val);   // visit"],
                [5, "    inorder(node->right, out);"],
                "}",
            ],
        },
    },
};

export default translations;
