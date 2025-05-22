export function extractTextFromChildren(children: any): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) {
    return children.map(extractTextFromChildren).join("");
  }
  if (typeof children === "object" && children?.props?.children) {
    return extractTextFromChildren(children.props.children);
  }
  return "";
}
