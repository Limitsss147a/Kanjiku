import { saveAllPatterns } from "./wagara";
import * as path from "node:path";

const OUTPUT_DIR = path.join(__dirname, "assets", "wagara");

console.log("Generating Wagara patterns...\n");
saveAllPatterns(OUTPUT_DIR);
console.log("\nAll patterns generated successfully!");