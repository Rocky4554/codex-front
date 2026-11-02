// Starter code per language. Problems read stdin and print to stdout, so the
// templates read all input lines and leave the solution to the user.
// Java must be `class solution` — the judge compiles solution.java and runs `java solution`.

const TEMPLATES = {
    python: `import sys

def main():
    lines = sys.stdin.read().strip().split("\\n")
    # Write your solution here


if __name__ == "__main__":
    main()
`,
    javascript: `const lines = require("fs").readFileSync(0, "utf8").trim().split("\\n");

// Write your solution here
`,
    java: `import java.util.*;
import java.io.*;

public class solution {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        List<String> lines = new ArrayList<>();
        String line;
        while ((line = br.readLine()) != null) lines.add(line);
        // Write your solution here

    }
}
`,
    cpp: `#include <iostream>
#include <sstream>
#include <string>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    vector<string> lines;
    string line;
    while (getline(cin, line)) lines.push_back(line);
    // Write your solution here

    return 0;
}
`,
    sql: `-- Write a single SELECT statement. The tables are created for you.
SELECT
`,
};

export function languageKey(language) {
    const name = String(language?.name || "").toLowerCase();
    if (name.includes("sql")) return "sql";
    if (name.includes("python")) return "python";
    if (name.includes("javascript") || name === "js") return "javascript";
    if (name.includes("c++") || name.includes("cpp")) return "cpp";
    if (name.includes("java")) return "java";
    return null;
}

export function starterCode(language) {
    return TEMPLATES[languageKey(language)] ?? "";
}

export function monacoLanguage(language) {
    return languageKey(language) ?? "plaintext";
}
