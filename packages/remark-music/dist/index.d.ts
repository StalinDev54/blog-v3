import { Parent, Root } from "mdast";

//#region src/index.d.ts
interface MusicScoreCodeBlock extends Parent {
  type: 'musicScoreCodeBlock';
}
declare module 'mdast' {
  interface RootContentMap {
    musicScoreCodeBlock: MusicScoreCodeBlock;
  }
}
declare function remarkMusic(): (tree: Root) => void;
//#endregion
export { remarkMusic as default };