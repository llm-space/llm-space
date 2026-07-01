import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { EditorView, type Extension } from "@uiw/react-codemirror";

export function createExtensions(language: "markdown" | "json") {
  const extensions: Extension[] = [EditorView.lineWrapping];
  switch (language) {
    case "json":
      extensions.push(json());
      break;
    default:
      extensions.push(
        markdown({
          codeLanguages: languages,
        })
      );
      break;
  }
  return extensions;
}
