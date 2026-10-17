import { visit } from "unist-util-visit";

//#region src/index.ts
function remarkMusic() {
	return (tree) => {
		visit(tree, "code", (node, index, parent) => {
			if (node.lang === "music-abc") {
				if (!parent || !index) return;
				parent.children?.splice(index, 1, {
					type: "musicScoreCodeBlock",
					children: [],
					data: {
						hName: "music-score",
						hProperties: { abc: node.value }
					}
				});
			}
		});
	};
}

//#endregion
export { remarkMusic as default };