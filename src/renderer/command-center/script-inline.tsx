import { javascript } from "@codemirror/lang-javascript";
import { basicSetup, EditorView } from "codemirror";
import { useEffect, useRef } from "react";

export const ScriptInline = ({
  content,
  onChange,
}: {
  content: string;
  onChange: (content: string) => void;
}) => {
  const divRef = useRef<HTMLDivElement>(null);
  const codeMirror = useRef<EditorView | null>(null);

  useEffect(() => {
    if (divRef.current) {
      const lang = javascript({ typescript: true });
      codeMirror.current = new EditorView({
        extensions: [basicSetup, lang],
        parent: divRef.current,
        doc: content,
        dispatch: function (transaction) {
          codeMirror.current!.update([transaction]);
          if (transaction.docChanged) {
            onChange(codeMirror.current!.state.doc.toString());
          }
        },
      });
    }
    () => {
      codeMirror.current?.destroy();
    };
  }, []);

  return <div ref={divRef}></div>;
};
