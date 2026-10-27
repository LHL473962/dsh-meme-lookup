/** One displayable top-level YAML frontmatter field. */
export interface FrontmatterEntry {
    key: string;
    value: string;
}
/** Split a leading YAML frontmatter block from its Markdown body. */
export declare function parseMarkdownFrontmatter(content: string): {
    body: string;
    entries: FrontmatterEntry[];
};
//# sourceMappingURL=frontmatter.d.ts.map